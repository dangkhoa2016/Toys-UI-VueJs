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
      toys: 'toyStore/getCachedToys',
      loadingToys: 'toyStore/getLoadingToys',
      errorLoadToys: 'toyStore/getErrorLoadToys',
    }),
    hasToys() {
      return Array.isArray(this.toys) && this.toys.length > 0;
    },
    showSkeletons() {
      return this.loadingToys && !this.hasToys;
    },
  },
  async mounted() {
    await this.ensureToysLoaded();
  },
  methods: {
    ...Vuex.mapActions({
      loadToys: 'toyStore/loadToys',
      importDemo: 'toyStore/importDemo',
    }),
    async ensureToysLoaded() {
      this.emptyStateError = '';
      const success = await this.loadToys();

      if (success && !this.hasToys) {
        await this.seedDemoToys(true);
      }
    },
    async reloadToys() {
      this.emptyStateError = '';
      await this.loadToys();
    },
    async seedDemoToys(isAutoSeed = false) {
      this.emptyStateError = '';
      this.seedingDemo = true;

      try {
        const success = await this.importDemo();
        if (!success) {
          this.emptyStateError = 'Could not load demo toys right now.';
          return;
        }

        await this.loadToys();
      } finally {
        this.seedingDemo = false;
      }

      if (isAutoSeed && !this.hasToys) {
        this.emptyStateError = 'Demo data is still empty after seeding.';
      }
    },
  },
};
