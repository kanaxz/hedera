const Router = require('./Router')

module.exports = class RootRoute extends Router {
  constructor(root) {
    super()
    this.root = root
  }

  async onMatch(req, res, next) {
    res.layouts = []
    const self = this
    res.page = async function (pageImport, args = [], options = {}) {
      await self.root.setPage(this.req, this.layouts, pageImport, args, options)
    }

    await super.onMatch(req, res, next)
  }
}
  .define()