import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import SafeAreaWrapper from "../../../../shared/components/SafeAreaWrapper";
import ModuleView from "../../../../features/curriculum/components/ModuleView";

/**
 * Module screen
 * Displays a specific module with its lessons
 * Supports preview mode for locked modules
 */
export default function ModuleScreen() {
  const { id, preview } = useLocalSearchParams();
  console.log(id);
  const router = useRouter();

  const isPreviewMode = preview === "true";

  // Handle lesson selection
  const handleLessonSelect = (lessonId) => {
    if (isPreviewMode) {
      // In preview mode, show a message instead of navigating
      alert("This lesson is locked. Complete previous modules to unlock it.");
      return;
    }
    router.push(`/tutor/lesson/${lessonId}`);
  };

  return (
    <SafeAreaWrapper>
      <ModuleView
        moduleId={id}
        onLessonSelect={handleLessonSelect}
        isPreviewMode={isPreviewMode}
      />
    </SafeAreaWrapper>
  );
}
