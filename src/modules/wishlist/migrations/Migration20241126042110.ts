import { Migration } from '@mikro-orm/migrations';

export class Migration20241126042110 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "wishlist" ("id" text not null, "customer_id" text not null, "product_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wishlist_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "wishlist" cascade;');
  }

}
