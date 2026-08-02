import redis

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)


def save_message(
    user_id: str,
    role: str,
    content: str
):

    key = f"chat:{user_id}"

    redis_client.rpush(
        key,
        f"{role}: {content}"
    )

    redis_client.ltrim(
        key,
        -10,
        -1
    )

    redis_client.expire(
        key,
        86400
    )


def get_memory(user_id: str):

    key = f"chat:{user_id}"

    messages = redis_client.lrange(
        key,
        0,
        -1
    )

    return "\n".join(messages)