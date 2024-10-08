const Scope = require('../scoping/Scope')
const Layout = require('./Layout')
const RootRouter = require("./routers/RootRouter")

module.exports = class Root extends Layout {
  constructor() {
    super()
    this.router = new RootRouter(this)
    this.router.on('match', this.b(this.onMatch))
  }

  async start(variables) {
    const scope = new Scope({ source: this, variables })
    await scope.render(this)
  }

  onMatch() {
    document.body.classList.add('sools-app-ready')
  }

  async loadLayouts(req, layoutsTypes) {
    let current = this
    const layouts = []
    for (let layoutType of layoutsTypes) {
      let args = {}
      if (!(layoutType.prototype instanceof Layout)) {
        layoutType = layoutType(req)
      }
      if (layoutType instanceof Array) {
        args = layoutType[1]
        layoutType = layoutType[0]
      }
      layoutType = await layoutType
      if (layoutType.default) {
        layoutType = layoutType.default
      }
      if (!(current.content instanceof layoutType)) {
        const layout = new layoutType()
        Object.assign(layout, args)
        await current.setContent(layout)
      } else {
        Object.assign(current.content, args)
      }
      current = current.content
      layouts.push(current)
    }
    return layouts
  }

  async setPage(req, layoutsTypes, pageImport, args = [], options = {}) {
    const layouts = await this.loadLayouts(req, layoutsTypes)
    const bottomLayout = layouts[layouts.length - 1]
    const pageModule = await pageImport
    const pageType = pageModule.default
    const page = new pageType(...args)
    let transition = options.transition || ((noop, next) => next())
    await transition(bottomLayout, async () => {
      await bottomLayout.setContent(page)
      await this.emit('pageLoaded', [layouts, page])
    })
  }
}.define()