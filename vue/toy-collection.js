/*jshint esversion: 9 */
import Toy from './toy.vue';
import ToySkeleton from './toy-skeleton.vue';

export default {
  components: {
    Toy,
    ToySkeleton,
  },
  data() {
    return {
      emptyStateError: '',
      seedingDemo: false,
      skeletonCount: 8,
    };
  },
  computed: {
    ...Vuex.mapGetters({
      toys: 'toyStore/getVisibleToys',
      allToys: 'toyStore/getToys',
      isLoadingToys: 'toyStore/getIsLoadingToys',
      loadToysError: 'toyStore/getLoadToysError',
    }),
    hasToys() {
      return Array.isArray(this.toys) && this.toys.length > 0;
    },
    hasStoredToys() {
      return Array.isArray(this.allToys) && this.allToys.length > 0;
    },
    showSkeletons() {
      return this.isLoadingToys && !this.hasStoredToys;
    },
    isFilteredEmpty() {
      return !this.isLoadingToys && !this.loadToysError && this.hasStoredToys && !this.hasToys;
    },
  },
  async mounted() {
    await this.ensureToysLoaded();
  },
  methods: {
    async ensureToysLoaded() {
      this.emptyStateError = '';
      await this.$store.dispatch('toyStore/loadInitialToys');
    },
    async reloadToys() {
      this.emptyStateError = '';
      await this.$store.dispatch('toyStore/loadInitialToys');
    },
    async seedDemoToys() {
      this.emptyStateError = '';
      this.seedingDemo = true;

      try {
        const success = await this.$store.dispatch('toyStore/seedDemoToys');
        if (!success) {
          this.emptyStateError = 'Could not load demo toys right now.';
          return;
        }

        await this.$store.dispatch('toyStore/loadInitialToys');
      } finally {
        this.seedingDemo = false;
      }
    },
  },
};
