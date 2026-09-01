plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.gantasmo.swaycommand"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.gantasmo.swaycommand"
        // 26 is the floor for adaptive launcher icons, which is what lets the icon be
        // a vector rather than five PNG densities. android.media.midi, the reason
        // this module exists at all, arrived in 23, so MIDI does not set the floor.
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isMinifyEnabled = false
        }
        release {
            // No shrinking. The Kotlin here is a few hundred lines of host
            // plumbing; every heavy thing in the application is JavaScript
            // inside assets, which R8 never sees.
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    // The bundle is written straight into src/main/assets by the npm script, so
    // there is no copy task. Failing early beats shipping an APK whose WebView
    // loads a blank page.
    applicationVariants.all {
        val check = tasks.register("verifyWebBundle${name.replaceFirstChar { it.uppercase() }}") {
            doFirst {
                val index = file("src/main/assets/index.html")
                if (!index.exists()) {
                    throw GradleException(
                        "android/app/src/main/assets/index.html is missing.\n" +
                            "Build the web bundle first, from the repository root:\n" +
                            "    npm run build:renderer:android",
                    )
                }
            }
        }
        preBuildProvider.configure { dependsOn(check) }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    // WebViewAssetLoader, and the document-start script injection that has to
    // run before app.js decides whether it owns the MIDI port.
    implementation("androidx.webkit:webkit:1.12.1")
}
