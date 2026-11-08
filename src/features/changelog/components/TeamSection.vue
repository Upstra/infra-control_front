<template>
  <div class="mt-16">
    <div class="text-center mb-12">
      <h2
        class="text-4xl font-bold text-text-strong mb-4"
      >
        {{ t('changelog.team.title') }}
      </h2>
      <p class="text-xl text-text max-w-2xl mx-auto">
        {{ t('changelog.team.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="group relative">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"
        ></div>
        <div
          class="relative bg-surface rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="relative mb-6">
            <div
              class="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary group-hover:ring-primary transition-all duration-300"
            >
              <div
                class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
              >
                <span class="text-4xl font-bold text-white">JA</span>
              </div>
            </div>
            <div
              class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              Lead Developer
            </div>
          </div>

          <div class="text-center">
            <h3 class="text-xl font-bold text-text-strong mb-1">
              James ABIB
            </h3>
            <p class="text-sm text-text mb-4">
              Lead Developer
            </p>

            <div class="flex flex-wrap gap-2 justify-center mb-4">
              <span
                class="px-2 py-1 bg-warning-surface text-warning-text text-xs rounded-full"
                >NestJS</span
              >
              <span
                class="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                >TypeScript</span
              >
              <span
                class="px-2 py-1 bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text text-xs rounded-full"
                >Vue.js</span
              >
            </div>

            <a
              href="https://www.linkedin.com/in/jamesabib/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-primary-text hover:text-primary-text transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                />
              </svg>
              <span class="text-sm font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <div class="group relative">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"
        ></div>
        <div
          class="relative bg-surface rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="relative mb-6">
            <div
              class="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300"
            >
              <div
                class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center"
              >
                <span class="text-4xl font-bold text-white">RK</span>
              </div>
            </div>
            <div
              class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              DevOps Engineer
            </div>
          </div>

          <div class="text-center">
            <h3 class="text-xl font-bold text-text-strong mb-1">
              Ronan KIELT
            </h3>
            <p class="text-sm text-text mb-4">
              DevOps Engineer
            </p>

            <div class="flex flex-wrap gap-2 justify-center mb-4">
              <span
                class="px-2 py-1 bg-warning-surface text-warning-text text-xs rounded-full"
                >Python</span
              >
              <span
                class="px-2 py-1 bg-warning-surface text-warning-text text-xs rounded-full"
                >NestJS</span
              >
              <span
                class="px-2 py-1 bg-surface-raised text-text text-xs rounded-full"
                >Linux</span
              >
            </div>

            <a
              href="https://www.linkedin.com/in/ronan-kielt/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-primary-text hover:text-primary-text transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                />
              </svg>
              <span class="text-sm font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <div class="group relative">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"
        ></div>
        <div
          class="relative bg-surface rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="relative mb-6">
            <div
              class="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-success group-hover:ring-success transition-all duration-300"
            >
              <div
                class="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
              >
                <span class="text-4xl font-bold text-white">CC</span>
              </div>
            </div>
            <div
              class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-success text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              Frontend Dev
            </div>
          </div>

          <div class="text-center">
            <h3 class="text-xl font-bold text-text-strong mb-1">
              Charles CRETOIS
            </h3>
            <p class="text-sm text-text mb-4">
              Frontend Developer
            </p>

            <div class="flex flex-wrap gap-2 justify-center mb-4">
              <span
                class="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                >TypeScript</span
              >
              <span
                class="px-2 py-1 bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text text-xs rounded-full"
                >Vue.js</span
              >
              <span
                class="px-2 py-1 bg-warning-surface text-warning-text text-xs rounded-full"
                >NestJS</span
              >
            </div>

            <a
              href="https://www.linkedin.com/in/charles-cretois-43882a17b/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-primary-text hover:text-primary-text transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                />
              </svg>
              <span class="text-sm font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center">
      <blockquote class="relative">
        <svg
          class="absolute -top-6 -left-4 w-16 h-16 text-text-faint"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path
            d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"
          />
        </svg>
        <p class="relative text-2xl italic text-text">
          {{ t('changelog.team.quote') }}
        </p>
        <cite class="block mt-4 text-sm text-text"
          >— {{ t('changelog.team.quoteAuthor') }}</cite
        >
      </blockquote>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
