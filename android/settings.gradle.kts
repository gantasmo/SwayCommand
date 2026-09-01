// The Android module is deliberately its own gradle build, not part of the npm
// tree. It consumes one artifact from it: the embedded web bundle, produced by
// `npm run build:renderer:android` into app/src/main/assets.

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SwayCommand"
include(":app")
