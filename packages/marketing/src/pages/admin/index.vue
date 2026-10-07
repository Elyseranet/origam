<template>
  <div class="admin-login">
    <origam-card
      class="admin-login__card"
      rounded="xl"
      elevation="md"
    >
      <template #default>
        <div class="admin-login__inner">
          <div class="admin-login__header">
            <origam-icon
              :icon="MDI_ICONS.SHIELD"
              class="admin-login__icon"
              aria-hidden="true"
            />

            <origam-title
              tag="h1"
              class="admin-login__title"
            >
              {{ t('admin.login.title', 'Admin area') }}
            </origam-title>

            <p class="admin-login__subtitle">
              {{ t('admin.login.subtitle', 'Enter the admin password to access the backoffice.') }}
            </p>
          </div>

          <origam-form
            class="admin-login__form"
            :aria-label="t('admin.login.a11y_form', 'Admin login form')"
            @submit.prevent="handleSubmit"
          >
            <origam-password-field
              v-model="password"
              :label="t('admin.login.password_label', 'Password')"
              :placeholder="t('admin.login.password_placeholder', 'Admin password')"
              variant="outlined"
              autofocus
              :disabled="loading"
              :error="!!errorMessage"
              :error-messages="errorMessage ? [errorMessage] : []"
              data-cy="admin-password"
            />

            <origam-btn
              type="submit"
              color="primary"
              variant="elevated"
              block
              :loading="loading"
              :disabled="!password.trim()"
              data-cy="admin-login-submit"
            >
              {{ t('admin.login.submit', 'Sign in') }}
            </origam-btn>
          </origam-form>
        </div>
      </template>
    </origam-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MDI_ICONS } from 'origam/enums'
import { useT } from '~/composables/useT'
import { useAdminReference } from '~/composables/useAdminReference'
import type { IAdminLoginResult } from '~/composables/useAdminReference'

definePageMeta({ layout: false })

useSeoMeta({
    title: 'Admin login',
    robots: 'noindex,nofollow',
})

const { t } = useT()
const router = useRouter()
const { isAuthenticated, login } = useAdminReference()

if (isAuthenticated.value) {
    await navigateTo('/admin/dashboard')
}

const password = ref('')
const loading = ref(false)
const errorKey = ref<IAdminLoginResult['error'] | null>(null)

const errorMessage = computed(() => {
    if (!errorKey.value) return null
    if (errorKey.value === 'wrong_password') {
        return t('admin.login.error_wrong_password', 'Incorrect password. Please try again.')
    }
    return t('admin.login.error_server', 'Server error. Please try again.')
})

async function handleSubmit () {
    if (!password.value.trim() || loading.value) return
    loading.value = true
    errorKey.value = null

    const result = await login(password.value)
    loading.value = false

    if (result.ok) {
        router.push('/admin/dashboard')
    } else {
        errorKey.value = result.error ?? 'server_error'
        password.value = ''
    }
}
</script>

<style scoped lang="scss">
.admin-login {
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: 100vh;
    padding: var(--origam-space---4, 1rem);
    background-color: var(--origam-color__surface---sunken, #f5f5f5);

    &__card {
        inline-size: 100%;
        max-inline-size: 420px;
    }

    &__inner {
        padding: var(--origam-space---8, 2rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---6, 1.5rem);
    }

    &__header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        text-align: center;
    }

    &__icon {
        font-size: 2.5rem;
        color: var(--origam-color__action--primary---bg, #7c3aed);
    }

    &__title {
        --origam-title---font-size: var(--origam-font-size---xl, 1.5rem);
        --origam-title---font-weight: 700;
        margin: 0;
    }

    &__subtitle {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        line-height: 1.5;
    }

    &__form {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
    }
}
</style>
