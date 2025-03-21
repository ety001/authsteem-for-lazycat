<template>
  <Center>
    <router-link to="/" class="d-inline-block my-2 no-decoration">
      <span class="logo iconfont icon-steemconnect" />
      <h4 class="m-0">AuthSteem</h4>
    </router-link>
    <div class="width-full p-4 mb-2">
      <form @submit.prevent="submitForm" method="post" class="text-left">
        <label for="username">Steem username</label>
        <div v-if="dirty.username && !!errors.username" class="error mb-2">
          {{ errors.username }}
        </div>
        <select
          id="username"
          v-model.trim="username"
          class="form-select input-lg input-block mb-2"
          autocorrect="off"
          autocapitalize="none"
          autocomplete="username"
          @blur="handleBlur('username')"
        >
          <option v-for="user in Object.keys(keychain)" :key="user" :value="user">
            {{ user }}
          </option>
        </select>
        <label for="password">
          Keychain password
          <span
            class="tooltipped tooltipped-n tooltipped-multiline"
            :aria-label="TOOLTIP_LOGIN_ENCRYPTION_KEY"
          >
            <span class="iconfont icon-info" />
          </span>
        </label>
        <div v-if="dirty.key && !!errors.key" class="error mb-2">
          {{ errors.key }}
        </div>
        <input
          id="password"
          v-model.trim="key"
          type="password"
          autocorrect="off"
          autocapitalize="none"
          autocomplete="current-password"
          class="form-control input-lg input-block mb-2"
          :class="{ 'mb-4': !error }"
          @blur="handleBlur('key')"
        />
        <div v-if="!!error" class="error mb-4">{{ error }}</div>
        <button
          :disabled="submitDisabled || isLoading"
          type="submit"
          class="btn btn-large btn-blue input-block mb-2"
        >
          Log in
        </button>
        <router-link
          :to="{ name: 'import', query: { redirect, authority } }"
          class="btn btn-large input-block text-center mb-2"
        >
          Import account
        </router-link>
      </form>
    </div>
    <Footer />
  </Center>
</template>

<script>
import { mapActions } from 'vuex';
import triplesec from 'triplesec';
import { getKeychain } from '@/helpers/keychain';
import { jsonParse } from '@/helpers/utils';
import { getAuthority } from '@/helpers/auth';
import {
  ERROR_INVALID_CREDENTIALS,
  ERROR_INVALID_ENCRYPTION_KEY,
  TOOLTIP_LOGIN_ENCRYPTION_KEY,
} from '@/helpers/messages.json';

export default {
  data() {
    return {
      keychain: {},
      dirty: {
        username: false,
        key: false,
      },
      error: '',
      isLoading: false,
      redirect: this.$route.query.redirect,
      authority: getAuthority(this.$route.query.authority),
      TOOLTIP_LOGIN_ENCRYPTION_KEY,
    };
  },
  computed: {
    username: {
      get() {
        return this.$store.state.persistentForms.login.username;
      },
      set(value) {
        this.$store.commit('saveLoginUsername', value);
      },
    },
    key: {
      get() {
        return this.$store.state.persistentForms.login.key;
      },
      set(value) {
        this.$store.commit('saveLoginKey', value);
      },
    },
    submitDisabled() {
      return !!this.errors.username || !!this.errors.key;
    },
    errors() {
      const current = {};
      const { username, key } = this;

      if (!username) {
        current.username = 'Username is required.';
      }

      if (!key) {
        current.key = 'Keychain password is required.';
      }

      return current;
    },
  },
  created() {
    this.loadKeychain();
  },
  methods: {
    ...mapActions(['login']),
    resetForm() {
      this.dirty = {
        username: false,
        key: false,
      };
      this.username = '';
      this.key = '';
    },
    async loadKeychain() {
      this.keychain = await getKeychain();
      const usernames = Object.keys(this.keychain);
      if (usernames.length > 0) {
        [this.username] = usernames;
      }
    },
    handleBlur(name) {
      this.dirty[name] = true;
    },
    submitForm() {
      const { authority } = this;
      const encryptedKeys = this.keychain[this.username];
      this.isLoading = true;

      triplesec.decrypt(
        {
          data: new triplesec.Buffer(encryptedKeys, 'hex'),
          key: new triplesec.Buffer(this.key),
        },
        (decryptError, buff) => {
          if (decryptError) {
            this.isLoading = false;
            this.error = ERROR_INVALID_ENCRYPTION_KEY;

            console.log('err', decryptError);
            return;
          }

          const keys = jsonParse(buff.toString());
          if (authority && !keys[authority]) {
            this.isLoading = false;
            this.error = `You need to import your account using your password or ${authority} key to do this request. Click "Import account" button to proceed.`;
            return;
          }

          this.login({ username: this.username, keys })
            .then(() => {
              const { redirect } = this.$route.query;
              this.$router.push(redirect || '/');
              this.isLoading = false;
              this.error = '';

              this.resetForm();
            })
            .catch(err => {
              console.log('Login failed', err);
              this.isLoading = false;
              this.error = ERROR_INVALID_CREDENTIALS;
            });
        },
      );
    },
  },
};
</script>
