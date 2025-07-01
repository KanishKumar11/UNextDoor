import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Heading,
  ModernCard,
  Spacer,
  Row,
  Column,
} from "../../../shared/components";
import modernTheme from "../../../shared/styles/modernTheme";
import { grammarService } from "../services/grammarService";

/**
 * GrammarAnalysis component
 * Displays detailed analysis of grammar in text
 *
 * @param {Object} props - Component props
 * @param {Object} props.analysis - Grammar analysis results
 */
const GrammarAnalysis = ({ analysis }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // If no analysis is provided, return null
  if (!analysis) return null;

  // Get feedback based on score
  const feedback = grammarService.getFeedbackForScore(analysis.score);

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall score */}
      <ModernCard style={styles.scoreCard}>
        <Heading level="h3" align="center" gutterBottom>
          Grammar Score
        </Heading>

        <View style={styles.scoreCircle}>
          <Text size="xxl" weight="bold" color={feedback.color}>
            {analysis.score}%
          </Text>
        </View>

        <Text
          align="center"
          color={feedback.color}
          weight="semibold"
          style={styles.feedbackText}
        >
          <Ionicons name={feedback.icon} size={16} color={feedback.color} />{" "}
          {feedback.message}
        </Text>

        <Spacer size="md" />

        <Text weight="semibold">Analyzed Text:</Text>
        <Text color="neutral.700" style={styles.analyzedText}>
          {analysis.text}
        </Text>
      </ModernCard>

      {/* Corrections */}
      {analysis.corrections && analysis.corrections.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("corrections")}
            activeOpacity={0.7}
          >
            <Heading level="h4">Corrections</Heading>
            <Ionicons
              name={
                expandedSection === "corrections"
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>

          {expandedSection === "corrections" && (
            <View style={styles.sectionContent}>
              {analysis.corrections.map((correction, index) => (
                <View key={index} style={styles.correctionItem}>
                  <Row justify="space-between" align="center">
                    <Text weight="semibold">Original:</Text>
                    {correction.severity !== "none" && (
                      <View
                        style={[
                          styles.severityBadge,
                          correction.severity === "minor"
                            ? styles.minorSeverity
                            : correction.severity === "moderate"
                            ? styles.moderateSeverity
                            : styles.majorSeverity,
                        ]}
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          color="white"
                          style={styles.severityText}
                        >
                          {correction.severity.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </Row>

                  <Text color="neutral.700" style={styles.correctionText}>
                    {correction.original}
                  </Text>

                  {correction.severity !== "none" && (
                    <>
                      <Text weight="semibold" style={styles.correctionLabel}>
                        Corrected:
                      </Text>
                      <Text color="success.600" style={styles.correctionText}>
                        {correction.corrected}
                      </Text>
                    </>
                  )}

                  <Text weight="semibold" style={styles.correctionLabel}>
                    Explanation:
                  </Text>
                  <Text color="neutral.700" style={styles.correctionText}>
                    {correction.explanation}
                  </Text>

                  {correction.rule && (
                    <Text color="primary.600" style={styles.ruleText}>
                      Rule: {correction.rule}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}

      {/* Grammar Rules */}
      {analysis.grammarRules && analysis.grammarRules.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("grammarRules")}
            activeOpacity={0.7}
          >
            <Heading level="h4">Grammar Rules Used</Heading>
            <Ionicons
              name={
                expandedSection === "grammarRules"
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>

          {expandedSection === "grammarRules" && (
            <View style={styles.sectionContent}>
              {analysis.grammarRules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text weight="semibold" color="primary.700">
                    {rule.rule}
                  </Text>

                  <Text color="neutral.700" style={styles.ruleExplanation}>
                    {rule.explanation}
                  </Text>

                  {rule.examples && rule.examples.length > 0 && (
                    <View style={styles.examplesContainer}>
                      <Text weight="semibold" size="sm">
                        Examples:
                      </Text>
                      {rule.examples.map((example, exIndex) => (
                        <Text
                          key={exIndex}
                          color="neutral.600"
                          size="sm"
                          style={styles.exampleText}
                        >
                          • {example}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}

      {/* Strengths and Weaknesses */}
      <ModernCard style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("strengthsWeaknesses")}
          activeOpacity={0.7}
        >
          <Heading level="h4">Strengths & Weaknesses</Heading>
          <Ionicons
            name={
              expandedSection === "strengthsWeaknesses"
                ? "chevron-up"
                : "chevron-down"
            }
            size={20}
            color={modernTheme.colors.neutral[600]}
          />
        </TouchableOpacity>

        {expandedSection === "strengthsWeaknesses" && (
          <View style={styles.sectionContent}>
            <Row>
              <Column flex={1} style={styles.strengthsColumn}>
                <Text
                  weight="semibold"
                  color="success.600"
                  style={styles.columnHeader}
                >
                  Strengths
                </Text>

                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((strength, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={
                          modernTheme.colors.success[500] ||
                          modernTheme.colors.success.main
                        }
                        style={styles.listIcon}
                      />
                      <Text color="neutral.700" style={styles.listText}>
                        {strength}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text color="neutral.600" style={styles.emptyText}>
                    No strengths identified
                  </Text>
                )}
              </Column>

              <Column flex={1} style={styles.weaknessesColumn}>
                <Text
                  weight="semibold"
                  color="error.600"
                  style={styles.columnHeader}
                >
                  Weaknesses
                </Text>

                {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((weakness, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color={
                          modernTheme.colors.error[500] ||
                          modernTheme.colors.error.main
                        }
                        style={styles.listIcon}
                      />
                      <Text color="neutral.700" style={styles.listText}>
                        {weakness}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text color="neutral.600" style={styles.emptyText}>
                    No weaknesses identified
                  </Text>
                )}
              </Column>
            </Row>
          </View>
        )}
      </ModernCard>

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("suggestions")}
            activeOpacity={0.7}
          >
            <Heading level="h4">Suggestions for Improvement</Heading>
            <Ionicons
              name={
                expandedSection === "suggestions"
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>

          {expandedSection === "suggestions" && (
            <View style={styles.sectionContent}>
              {analysis.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Ionicons
                    name="bulb-outline"
                    size={20}
                    color={modernTheme.colors.primary[500]}
                    style={styles.suggestionIcon}
                  />
                  <Text color="neutral.700" style={styles.suggestionText}>
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}

      {/* Next Level Tips */}
      {analysis.nextLevelTips && analysis.nextLevelTips.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("nextLevelTips")}
            activeOpacity={0.7}
          >
            <Heading level="h4">Tips for Next Level</Heading>
            <Ionicons
              name={
                expandedSection === "nextLevelTips"
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>

          {expandedSection === "nextLevelTips" && (
            <View style={styles.sectionContent}>
              {analysis.nextLevelTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={modernTheme.colors.accent[500]}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}

      <Spacer size="xl" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoreCard: {
    marginBottom: 16,
    padding: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: modernTheme.colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
  },
  feedbackText: {
    marginTop: 8,
  },
  analyzedText: {
    marginTop: 8,
    padding: 8,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 4,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.neutral[200],
  },
  correctionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  minorSeverity: {
    backgroundColor:
      modernTheme.colors.warning[500] || modernTheme.colors.warning.main,
  },
  moderateSeverity: {
    backgroundColor:
      modernTheme.colors.error[500] || modernTheme.colors.error.main,
  },
  majorSeverity: {
    backgroundColor:
      modernTheme.colors.error[700] || modernTheme.colors.error.dark,
  },
  severityText: {
    fontSize: 10,
  },
  correctionText: {
    marginBottom: 8,
  },
  correctionLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  ruleText: {
    fontStyle: "italic",
    marginTop: 4,
  },
  ruleItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  ruleExplanation: {
    marginTop: 4,
    marginBottom: 8,
  },
  examplesContainer: {
    marginTop: 8,
  },
  exampleText: {
    marginTop: 4,
    marginLeft: 8,
  },
  strengthsColumn: {
    marginRight: 8,
  },
  weaknessesColumn: {
    marginLeft: 8,
  },
  columnHeader: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
  },
  emptyText: {
    fontStyle: "italic",
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  suggestionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
  },
});

export default GrammarAnalysis;
