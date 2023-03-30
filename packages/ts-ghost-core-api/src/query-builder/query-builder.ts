import { parseBrowseParams } from "./browse-params";
import type { BrowseParams } from "./browse-params";
import type { APICredentials } from "../schemas";
import { z, ZodRawShape } from "zod";
import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { ReadFetcher } from "../fetchers/read-fetcher";

export type OrderObjectKeyMask<Obj> = { [k in keyof Obj]?: "ASC" | "DESC" };

/**
 * QueryBuilder class that accepts a schema and an API credentials object. It will return a class
 * instance with browse and read functions.
 */
export class QueryBuilder<
  Shape extends ZodRawShape = any,
  IdentityShape extends z.ZodTypeAny = any,
  IncludeShape extends ZodRawShape = any,
  Api extends APICredentials = any
> {
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      identitySchema: IdentityShape;
      include: z.ZodObject<IncludeShape>;
    },
    protected _api: Api
  ) {}

  /**
   * Browse function that accepts browse params order, filter, page and limit. Will return an instance
   * of BrowseFetcher class.
   */
  public browse<
    const OrderStr extends string,
    const FilterStr extends string,
    const P extends {
      order?: OrderStr;
      limit?: number | string;
      page?: number | string;
      filter?: FilterStr;
    }
  >(options?: BrowseParams<P, Shape & IncludeShape>) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        browseParams: (options && parseBrowseParams(options, this.config.schema, this.config.include)) || undefined,
      },
      this._api
    );
  }

  /**
   * Read function that accepts Identify fields like id, slug or email. Will return an instance
   * of ReadFetcher class.
   */
  public read(options: z.infer<IdentityShape>) {
    return new ReadFetcher(
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        identity: this.config.identitySchema.parse(options),
      },
      this._api
    );
  }
}
