import "server-only";
import { freshServerApi, fetchPublic } from "@/lib/api/server";

export async function getPublicPromotions() {
  return (await fetchPublic(freshServerApi.GET("/api/v1/promotions/available"))).data;
}
