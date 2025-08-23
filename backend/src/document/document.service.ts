import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { DocumentEnity } from './entities/document.entity';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEnity)
    private readonly documentRepo: Repository<DocumentEnity>,
    private configService: ConfigService,
  ) {}

  async findById(id: string): Promise<DocumentEnity | null> {
    return this.documentRepo.findOne({ where: { id } });
  }

  async create(file: {
    filename: string;
    s3Path: string;
    mimetype: string;
    size: number;
  }) {
    const doc = this.documentRepo.create({
      filename: file.filename,
      status: DocumentStatus.PENDING,
      type: file.mimetype,
      size: file.size,
      s3Path: file.s3Path,
    });
    return this.documentRepo.save(doc);
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const docuemnt = await this.findById(id);
    if (!docuemnt) throw new NotFoundException('Document not found');
    Object.assign(docuemnt, { ...dto });
    return this.documentRepo.save(docuemnt);
  }

  async findOne(id: string) {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async findAll(
    filter?: FilterDocumentDto,
  ): Promise<{ documents: DocumentEnity[]; meta: { totalRecords: number } }> {
    let where: FindOptionsWhere<DocumentEnity>[] = [];
    if (filter?.search) {
      where.push({ filename: Like(`%${filter.search}%`) });
    }
    if (filter?.status) {
      where.push({ status: filter.status });
    }
    const [documents, totalRecords] = await this.documentRepo.findAndCount({
      where: where,
      skip: filter?.offset ?? 0,
      take:
        filter?.limit ??
        this.configService.get('common.pagination.defaultRecord'),
      order: { createdAt: 'desc' },
    });
    return { documents, meta: { totalRecords } };
  }

  async remove(id: string) {
    try {
      await this.documentRepo.delete(id);
      return { deleted: true };
    } catch (error) {
      throw new NotFoundException('Document not found');
    }
  }
}
