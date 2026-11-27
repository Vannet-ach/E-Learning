declare module "prisma/config" {
  export function defineConfig(config: {
    datasource?: {
      url?: string | undefined;
    };
  }): unknown;
}
