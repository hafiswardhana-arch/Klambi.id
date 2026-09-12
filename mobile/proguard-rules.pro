# ==============================================================================
# Klambi.id - Production R8 / ProGuard Obfuscation & Security Rules
# ==============================================================================

# Enable maximum aggressive optimizations
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Repackage all internal classes to flatten package hierarchy & hinder reverse engineering
-repackageclasses 'id.klambi.internal'
-allowaccessmodification

# Obfuscate class, field, and method names
-overloadaggressively
-useuniqueclassmembernames

# Strip debugging information, line numbers, and source file references
-renamesourcefileattribute SourceFile
-keepattributes !SourceFile,!LineNumberTable

# Strip sensitive logging methods in release APK
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
}

# Preserve WebView Javascript Interface for hybrid bridges while obfuscating internals
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Prevent reflection tampering on cryptographic primitives
-keep class javax.crypto.** { *; }
-keep class java.security.** { *; }
-keep class org.bouncycastle.** { *; }

# Preserve native methods (JNI)
-keepclasseswithmembernames class * {
    native <methods>;
}
