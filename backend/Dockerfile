FROM rust:slim-bookworm AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY backend/Cargo.toml backend/Cargo.toml
COPY backend/src backend/src

RUN cargo build --release -p agrograte-backend

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/* \
    && groupadd -r agrograte && useradd -r -g agrograte -d /home/agrograte -s /sbin/nologin agrograte \
    && mkdir -p /home/agrograte && chown -R agrograte:agrograte /home/agrograte

COPY --from=builder /app/target/release/agrograte-backend /usr/local/bin/agrograte-backend

USER agrograte

EXPOSE 8080

CMD ["agrograte-backend"]
