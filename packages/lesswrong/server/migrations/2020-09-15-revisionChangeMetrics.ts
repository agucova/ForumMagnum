import { registerMigration, forEachDocumentBatchInCollection } from './migrationUtils';
import { getPrecedingRev, htmlToChangeMetrics } from '../editor/make_editable_callbacks';
import Revisions from '../../lib/collections/revisions/collection'

registerMigration({
  name: "revisionChangeMetrics",
  dateWritten: "2020-09-15",
  idempotent: true,
  action: async () => {
    await forEachDocumentBatchInCollection({
      collection: Revisions,
      batchSize: 1000,
      callback: async (revisions: Array<DbRevision>) => {
        const changes: Array<any> = [];
        await Promise.all(revisions.map(async (rev: DbRevision) => {
          const previousRev = await getPrecedingRev(rev);
          const changeMetrics = htmlToChangeMetrics(previousRev?.html || "", rev.html);
          changes.push({
            updateOne: {
              filter: { _id: rev._id },
              update: { $set: { changeMetrics } },
            }
          });
        }));
        await Revisions.rawCollection().bulkWrite(changes, { ordered: false });
      }
    });
  }
});
