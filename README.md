docker run \
    --name postgis \
    --network="host" \
    -e POSTGRES_DB="osm" \
    -e POSTGRES_USER="osm" \
    -e POSTGRES_PASSWORD="osm" \
    -p 5432:5432 \
    -d openmaptiles/postgis

osm2pgsql --create --database osm --username osm --password osm --host 127.0.0.1 --port 5432 /home/anhle4/Downloads/osm/vietnam-latest.osm.pbf

docker run --rm \
    --network="host" \
    -v $(pwd):/import \
    -v $(pwd):/mapping \
    -e POSTGRES_USER="osm" \
    -e POSTGRES_PASSWORD="osm" \
    -e POSTGRES_HOST="127.0.0.1" \
    -e POSTGRES_DB="osm" \
    -e POSTGRES_PORT="5432" \
    openmaptiles/import-osm