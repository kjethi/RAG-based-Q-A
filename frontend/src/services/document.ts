import { AxiosError } from "axios";
import type { Doc } from "../classes/Doc";
import type { MetaData } from "../classes/MetaData";
import { apiGet } from "./api";

interface DocumentsFilters {
  search?: string;
  offset?: number;
  limit?: number;
}
export const documentService = {
  async getDocuments(
    filters?: DocumentsFilters
  ): Promise<{ meta: MetaData; documents: Doc[] }> {
    try {

      const res = await apiGet<{ data: { meta: MetaData; documents: Doc[] } }>(
        `/documents`, {params :filters }
      );
      return res.data.data;
    } catch (error) {
      let errorDetail = "Failed to fetch documents";
      if (error instanceof AxiosError) {
        errorDetail =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },
};
