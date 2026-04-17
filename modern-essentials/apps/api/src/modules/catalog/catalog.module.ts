import { Module } from "@nestjs/common";
import { AwsS3Module } from "../aws-s3/aws-s3.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { TestSeedService } from "./test-seed";

@Module({
  imports: [AwsS3Module],
  controllers: [CatalogController],
  providers: [CatalogService, TestSeedService],
  exports: [CatalogService],
})
export class CatalogModule {}
