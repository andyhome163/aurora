import AuTableHead from './_table-head.js'
import AuTableBody from './_table-body.js'
import AuTableFixed from './_table-fixed.js'
import TableColumn from './_table-column.js'
import { TableModel } from './_table-model.js'
import resizer from '../../utils/_resizer.js'

const AuTable = Vue.extend({
  template: require('./_table.jade'),
  components: {
    AuTableHead,
    AuTableBody,
    AuTableFixed
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    noHeader: Boolean, // depre
    showHeader: {
      type: Boolean,
      default: true
    },
    loading: Boolean,
    maxHeight: [String, Number],
    bordered: Boolean
  },
  data () {
    return {
      columns: [],
      model: null,
      timestamp: new Date()
    }
  },
  computed: {
    style () {
      this.timestamp
      const maxHeight = String(this.maxHeight) || 'auto'

      if (maxHeight.match(/^\d+$/)) {
        maxHeight += 'px'
      }

      return {
        'min-width': this.model ? this.model.minWidth : 'auto',
        'max-height': maxHeight
      }
    },
    cls () {
      const cls = []
      if (this.bordered) {
        cls.push('au-table-bordered')
      }
      return cls
    },
    mainColumns () {
      this.timestamp
      return this.model ?
             this.model.columns.filter((column) => {
               return !column.fixed
             }) : []
    }
  },
  created () {
    this.$on('update.table', this.onUpdateTable)
    this.onUpdateTable()
  },
  mounted () {
    this.$refs.scroll.addEventListener('scroll', this.onScroll)
    resizer.add(this.$el, this.calPosition)
    this.$nextTick(this.calPosition)
  },
  beforeDestroy () {
    this.$refs.scroll.removeEventListener('scroll', this.onScroll)
    resizer.remove(this.$el, this.calPosition)
  },
  methods: {
    calPosition () {
      const scroll = this.$refs.scroll
      const table = scroll.querySelector('table')
      const scrollRect = scroll.getBoundingClientRect()
      const rect = table.getBoundingClientRect()

      const leftFixed = this.$refs.leftFixed
      const rightFixed = this.$refs.rightFixed
      const headScroll = this.$refs.headScroll

      const scrollWidth = this.getScrollWidth()
      const scrollWidthPx = `${scrollWidth}px`

      this.model.tableWidth = rect.width

      this.$nextTick(() => {
        if (scrollRect.height < rect.height - scrollWidth) {
          if (headScroll) {
            headScroll.$el.style.paddingRight = scrollWidthPx
          }

          if (rightFixed) {
            rightFixed.$el.style.right = scrollWidthPx
          }
        } else {
          if (headScroll) {
            headScroll.$el.style.paddingRight = 0
          }
          if (rightFixed) {
            rightFixed.$el.style.right = '0'
          }
        }

        if (scrollRect.width < rect.width - scrollWidth) {
          if (leftFixed) {
            leftFixed.$el.style.bottom = scrollWidthPx
          }
          if (rightFixed) {
            rightFixed.$el.style.bottom = scrollWidthPx
          }
        } else {
          if (leftFixed) {
            leftFixed.$el.style.bottom = 0
          }
          if (rightFixed) {
            rightFixed.$el.style.bottom = 0
          }
        }
      })

      if (headScroll) {
        const headRect = headScroll.$el.getBoundingClientRect()
        this.model.tableHeadHeight = headRect.height
      }

      setTimeout(() => {
        this.onScroll()
      }, 100)
    },
    onScroll () {
      const target = this.$refs.scroll
      console.log(target.scrollLeft, target.scrollTop)
      this.model.tableScrollLeft = target.scrollLeft
      this.model.tableScrollTop = target.scrollTop
    },
    onUpdateTable () {
      this.timestamp = new Date()
      this.updateColumns()
      this.model = new TableModel(this)
    },
    updateColumns () {
      this.columns = (this.$slots.default || []).filter((slot) => {
        return slot.componentInstance instanceof TableColumn
      }).map((slot, index) => {
        return slot.componentInstance
      })
    },
    getScrollWidth () {
      var outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

      document.body.appendChild(outer);

      var widthNoScroll = outer.offsetWidth;
      // force scrollbars
      outer.style.overflow = "scroll";

      // add innerdiv
      var inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);

      var widthWithScroll = inner.offsetWidth;

      // remove divs
      outer.parentNode.removeChild(outer);

      return widthNoScroll - widthWithScroll;
    }
  },
  watch: {
    data () {
      this.$nextTick(this.onUpdateTable)
    }
  }
})

Vue.component('au-table', AuTable)

export default AuTable
