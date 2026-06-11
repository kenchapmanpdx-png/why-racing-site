// All /api/races methods are now served by the Express app in server.js.
// This file used to handle GET-only and shadowed the Express POST route, which
// broke the admin "create race" form. Kept as a thin proxy so that even if this
// file is not deleted from the repo, requests still reach Express and the right
// handler runs. Safe to remove once you confirm Vercel routes correctly without it.
//
// See AUDIT.md C1 for context.

module.exports = require('../server.js');
