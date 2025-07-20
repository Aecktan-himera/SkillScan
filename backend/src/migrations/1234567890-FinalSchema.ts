import { MigrationInterface, QueryRunner } from "typeorm";

export class FinalSchema implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        await queryRunner.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                role VARCHAR(10) NOT NULL DEFAULT 'user' 
                    CHECK (role IN ('user', 'admin')),
                settings JSONB NOT NULL DEFAULT '{"darkMode": false, "testTimer": 30}'::jsonb,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE topics (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT
            );

            CREATE TABLE tokens (
                id SERIAL PRIMARY KEY,
                token VARCHAR(512) NOT NULL UNIQUE,
                jti VARCHAR(36) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                blacklisted BOOLEAN NOT NULL DEFAULT false,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
            );
            CREATE INDEX idx_tokens_expires ON tokens(expires_at);
            CREATE INDEX idx_tokens_user ON tokens(user_id);

            CREATE TABLE questions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                explanation TEXT,
                difficulty VARCHAR(10) NOT NULL 
                    CHECK (difficulty IN ('easy', 'medium', 'hard')),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
            );
            CREATE INDEX idx_questions_topic ON questions(topic_id);
            CREATE INDEX idx_questions_creator ON questions(created_by);

            CREATE TABLE options (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL
            );
            CREATE INDEX idx_options_question ON options(question_id);

            CREATE TABLE test_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
                score INTEGER NOT NULL CHECK (score >= 0),
                completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                answers JSONB NOT NULL,
                time_spent INTEGER NOT NULL CHECK (time_spent > 0)
            );
            CREATE INDEX idx_test_history_user ON test_history(user_id);
            CREATE INDEX idx_test_history_topic ON test_history(topic_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS test_history CASCADE;
            DROP TABLE IF EXISTS options CASCADE;
            DROP TABLE IF EXISTS questions CASCADE;
            DROP TABLE IF EXISTS tokens CASCADE;
            DROP TABLE IF EXISTS topics CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP EXTENSION IF EXISTS "pgcrypto";
        `);
    }
}