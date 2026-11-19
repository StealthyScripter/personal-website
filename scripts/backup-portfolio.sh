#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

if [[ $# != 3 || ! $2 =~ ^portfolio-[a-z0-9-]+$ ]]; then
    echo "Usage: $0 {backup|restore} portfolio-RELEASE SNAPSHOT_DIRECTORY" >&2
    exit 2
fi
action=$1
project=$2
snapshot=$3
check_offline() {
    local volume=$1
    docker volume inspect "$volume" >/dev/null
    local running
    running=$(docker ps -q --filter "volume=$volume")
    if [[ -n $running ]]; then
        echo "Stop all containers using $volume before copying it." >&2
        exit 1
    fi
}

case "$action" in
    backup)
        mkdir -m 700 -- "$snapshot"
        for data in postgres_data media_data; do
            volume="${project}_$data"
            check_offline "$volume"
            docker run --rm --network none --mount "type=volume,src=$volume,dst=/volume,readonly" \
                --entrypoint tar portfolio-postgres:18 -C /volume --numeric-owner -cpf - . > "$snapshot/$data.tar"
            tar -tf "$snapshot/$data.tar" >/dev/null
        done
        (cd "$snapshot" && sha256sum postgres_data.tar media_data.tar > SHA256SUMS)
        ;;
    restore)
        (cd "$snapshot" && sha256sum -c SHA256SUMS)
        for data in postgres_data media_data; do
            volume="${project}_$data"
            if docker volume inspect "$volume" >/dev/null 2>&1; then
                echo "Restore requires a new volume. $volume already exists." >&2
                exit 1
            fi
        done
        for data in postgres_data media_data; do
            volume="${project}_$data"
            docker volume create "$volume" >/dev/null
            docker run --rm -i --network none --mount "type=volume,src=$volume,dst=/volume" \
                --entrypoint tar portfolio-postgres:18 -C /volume --numeric-owner --same-owner -xpf - < "$snapshot/$data.tar"
        done
        ;;
    *)
        echo "Unknown backup action $action" >&2
        exit 2
        ;;
esac
