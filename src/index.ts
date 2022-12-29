import {
	type IdempotencyResource,
	type IIdempotencyDataAdapter,
} from 'express-idempotency';

import {
	createClient,
	type RedisClientOptions,
	type RedisClientType,
} from '@redis/client';

const timeToLive = 86_400;

type PartialRedisAdapterOptions = {
	ttl?: number;
};

type RedisAdapterOptionsWithInstance = {
	connectionConfig?: never;
	connectionInstance: RedisClientType;
} & PartialRedisAdapterOptions;

type RedisAdapterOptionsWithConfig = {
	connectionConfig?: RedisClientOptions;
	connectionInstance?: never;
} & PartialRedisAdapterOptions;

type RedisAdapterOptions =
  | RedisAdapterOptionsWithInstance
  | RedisAdapterOptionsWithConfig;

class RedisAdapter implements IIdempotencyDataAdapter {
	#ttl;
	#client;

	constructor({
		connectionConfig,
		connectionInstance,
		ttl = timeToLive,
	}: RedisAdapterOptions) {
		this.#client = connectionInstance ?? createClient(connectionConfig);
		this.#ttl = ttl;
	}

	get isOpen() {
		return this.#client.isOpen;
	}

	get isReady() {
		return this.#client.isReady;
	}

	async connect() {
		await this.#client.connect();
	}

	async disconnect() {
		await this.#client.disconnect();
	}

	async findByIdempotencyKey(idempotencyKey: string) {
		const jsonDump = await this.#client.get(idempotencyKey);

		if (jsonDump) {
			const payload = {
				idempotencyKey,
				...(JSON.parse(jsonDump) as Omit<
				IdempotencyResource,
				'idempotencyKey'
				>),
			};

			return payload;
		}

		return null;
	}

	async #createOrUpdate({idempotencyKey, ...payload}: IdempotencyResource) {
		const jsonDump = JSON.stringify(payload);
		const key = 'EX';

		await this.#client.set(idempotencyKey, jsonDump, {
			[key]: this.#ttl,
		});
	}

	async create(idempotencyResource: IdempotencyResource) {
		await this.#createOrUpdate(idempotencyResource);
	}

	async update(idempotencyResource: IdempotencyResource) {
		await this.#createOrUpdate(idempotencyResource);
	}

	async delete(idempotencyKey: string) {
		await this.#client.del(idempotencyKey);
	}
}

export default RedisAdapter;
