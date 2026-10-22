/**
 * db-entities.const.ts — the single ordered list of TypeORM entities consumed by the DataSource
 * (runtime, migration CLI, ingestion pipeline). Server/tooling only: imports the entity classes.
 */

import { DocEntry } from '../../server/db/entities/doc-entry.entity'
import { DocProp } from '../../server/db/entities/doc-prop.entity'
import { DocValue } from '../../server/db/entities/doc-value.entity'
import { DocParam } from '../../server/db/entities/doc-param.entity'
import { DocReturn } from '../../server/db/entities/doc-return.entity'
import { DocEmit } from '../../server/db/entities/doc-emit.entity'
import { DocSlot } from '../../server/db/entities/doc-slot.entity'
import { DocExample } from '../../server/db/entities/doc-example.entity'
import { DocDirectiveArg } from '../../server/db/entities/doc-directive-arg.entity'
import { DocDirectiveModifier } from '../../server/db/entities/doc-directive-modifier.entity'
import { DocRelation } from '../../server/db/entities/doc-relation.entity'
import { DocCategory } from '../../server/db/entities/doc-category.entity'
import { DocSyncRun } from '../../server/db/entities/doc-sync-run.entity'
import { DocMeta } from '../../server/db/entities/doc-meta.entity'
import { Theme } from '../../server/db/entities/theme.entity'

export const ENTITIES = [
    DocEntry, DocProp, DocValue, DocParam, DocReturn, DocEmit, DocSlot,
    DocExample, DocDirectiveArg, DocDirectiveModifier, DocRelation,
    DocCategory, DocSyncRun, DocMeta, Theme,
]
