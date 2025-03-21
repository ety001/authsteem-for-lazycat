<template>
  <div id="app" :class="{ 'app--extension': isExtension }">
    <template v-if="networkUnreachable || loaded">
      <router-view />
    </template>
    <VueLoadingIndicator v-else-if="showLoading" class="overlay fixed big" />
    <VueModal
      v-if="openModal"
      title="Bug report preview"
      locked="true"
      class="small"
      @close="open = false"
    >
      <div class="default-body">
        The API URL is not visitable.<br>
        Please check your network connection, <br />
        or edit the API URL in the settings.
      </div>
      <div slot="footer" class="actions">
        <VueButton class="primary" @click="openModal = false">Close</VueButton>
      </div>
    </VueModal>
  </div>
</template>

<script>
import { isChromeExtension } from '@/helpers/utils';

const LOADING_ICON_TIMEOUT = 300;

export default {
  data() {
    return {
      networkUnreachable: false,
      openModal: false,
      initialized: false,
      showLoading: false,
    };
  },
  computed: {
    loaded() {
      return !!this.$store.state.settings.properties.head_block_number;
    },
    isExtension() {
      return isChromeExtension();
    },
  },
  created() {
    const loadingTimeout = setTimeout(() => {
      this.showLoading = true;
    }, LOADING_ICON_TIMEOUT);

    this.$store.dispatch('getDynamicGlobalProperties').then(() => {
      clearTimeout(loadingTimeout);

      this.showLoading = false;
      this.networkUnreachable = false;
    }).catch(() => {
      this.openModal = true;
      this.showLoading = false;
      this.networkUnreachable = true;
    });
  },
  beforeUpdate() {
    if (this.initialized) return;

    this.initialized = true;
  },
};
</script>

<style scoped lang="less">
@import './vars';

.content {
  position: relative;
  left: 0;
  transition: left 0.3s;
}
</style>
