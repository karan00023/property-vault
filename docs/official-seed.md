# Official Seed Pipeline

`npm run db:seed:official` loads the first reviewed collection from source-backed records. It is intentionally small and quality-biased.

The seed:

- checks each official leasing URL before publishing
- inserts source records with fetch time and source URL
- inserts field-level provenance for publication-critical fields
- records confidence by source
- creates sourcing tasks for missing floor plans and licensed photos
- publishes only after the deferred database publication guard can pass

Seeded buildings currently cover Manhattan, Brooklyn, and Jersey City. Missing rents, availability, photos, and floor plans stay missing unless the source publishes them and they can be reviewed.

This is not a static application database. The website reads only PostgreSQL/PostGIS.
