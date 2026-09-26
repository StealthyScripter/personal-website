# syntax=docker/dockerfile:1
# MinIO community releases are source-only. Build a fixed upstream release.
ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z
FROM golang:1.25-bookworm AS build
ARG MINIO_VERSION
RUN git clone --depth 1 --branch "${MINIO_VERSION}" https://github.com/minio/minio.git /src
WORKDIR /src
RUN CGO_ENABLED=0 go build -p 2 -trimpath -o /out/minio .

FROM debian:bookworm-slim
ARG MINIO_VERSION
LABEL org.opencontainers.image.source="https://github.com/minio/minio" \
      org.opencontainers.image.version="${MINIO_VERSION}" \
      org.opencontainers.image.licenses="AGPL-3.0-only"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 minio && useradd --uid 1000 --gid minio --create-home minio \
    && mkdir /data && chown minio:minio /data
COPY --from=build /out/minio /usr/local/bin/minio
COPY --from=build /src/LICENSE /usr/share/licenses/minio/LICENSE
USER minio
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
