import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { TestSeedService } from "./test-seed";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, PrismaService, AwsS3Service, TestSeedService],
  exports: [CatalogService],
})
export class CatalogModule {}
