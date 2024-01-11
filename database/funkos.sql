SELECT 'CREATE DATABASE funkos'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'funkos');

DROP TABLE IF EXISTS "funko";
DROP SEQUENCE IF EXISTS funkos_id_seq;
DROP TABLE IF EXISTS "category";


CREATE SEQUENCE funkos_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 7 CACHE 1;

CREATE TABLE "public"."funko"
(
    "id"                        bigint                         DEFAULT nextval('funkos_id_seq') NOT NULL,
    "name"                    character varying(255),
    "price"                    double precision               DEFAULT '0.0',
    "quantity"                  integer                        DEFAULT '0',
    "img"                    text                           DEFAULT 'https://via.placeholder.com/150',
    "created_at"            timestamp                          DEFAULT CURRENT_TIMESTAMP           NOT NULL,
    "updated_at"            timestamp                          DEFAULT CURRENT_TIMESTAMP           NOT NULL,
    "is_deleted"    boolean                                    DEFAULT false,
    "categoria_id"  uuid,
    CONSTRAINT "funkos_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

DROP TABLE IF EXISTS "category";
CREATE TABLE "public"."category" (
                                       "is_deleted" boolean DEFAULT false NOT NULL,
                                       "created_at" timestamp DEFAULT now() NOT NULL,
                                       "updated_at" timestamp DEFAULT now() NOT NULL,
                                       "id" uuid NOT NULL,
                                       "name_category" character varying(255) NOT NULL,
                                       CONSTRAINT "categorias_nombre_key" UNIQUE ("name_category"),
                                       CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "category" ("is_deleted", "created_at", "updated_at", "id", "name_category") VALUES
                                                                                        ('f', '2023-11-02 11:43:24.717712', '2023-11-02 11:43:24.717712', 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9', 'SERIE'),
                                                                                        ('f', '2023-11-02 11:43:24.717712', '2023-11-02 11:43:24.717712', '6dbcbf5e-8e1c-47cc-8578-7b0a33ebc154','DISNEY'),
                                                                                        ('f', '2023-11-02 11:43:24.717712', '2023-11-02 11:43:24.717712', '9def16db-362b-44c4-9fc9-77117758b5b0','SUPERHEROES'),
                                                                                        ('f', '2023-11-02 11:43:24.717712', '2023-11-02 11:43:24.717712', '8c5c06ba-49d6-46b6-85cc-8246c0f362bc', 'PELICULAS'),
                                                                                        ('f', '2023-11-02 11:43:24.717712', '2023-11-02 11:43:24.717712', 'bb51d00d-13fb-4b09-acc9-948185636f79', 'OTROS');

INSERT INTO "funko" ("id", "name", "price", "quantity", "img", "created_at", "updated_at", "is_deleted", "categoria_id")
VALUES (1, 'Funko Iron Man', 19.99, 50, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9'),
       (2, 'Funko Spider-Man', 14.99, 75, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', '6dbcbf5e-8e1c-47cc-8578-7b0a33ebc154'),
       (3, 'Funko Yoda', 16.99, 32, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', '9def16db-362b-44c4-9fc9-77117758b5b0'),
       (4, 'Funko Naruto', 11.99, 29, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', '8c5c06ba-49d6-46b6-85cc-8246c0f362bc'),
       (5, 'Funko Master Chief', 13.99, 12, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', 'bb51d00d-13fb-4b09-acc9-948185636f79'),
       (6, 'Funko Hulk', 25.99, 14, 'https://via.placeholder.com/150' , '2023-11-29 15:30:45.123456', '2023-11-29 15:30:45.123456', 'f', 'bb51d00d-13fb-4b09-acc9-948185636f79');


ALTER TABLE ONLY "public"."funko"
    ADD CONSTRAINT "fk2fwq10nwymfv7fumctxt9vpgb" FOREIGN KEY (categoria_id) REFERENCES category (id) NOT DEFERRABLE;
