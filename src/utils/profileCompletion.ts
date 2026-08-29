import { UserProfile } from '../types';

export interface ProfileCompletionStatus {
  percentage: number;
  message: string;
  missingItems: Array<{
    id: string;
    label: string;
    suggestion: string;
    actionType: 'photos' | 'interests' | 'lifestyle' | 'bio' | 'verification' | 'goals' | 'values';
  }>;
}

export function calculateProfileCompletion(user: UserProfile | null): ProfileCompletionStatus {
  if (!user) {
    return { percentage: 0, message: 'Welcome to SilverHeart', missingItems: [] };
  }

  let score = 0;
  const missingItems: ProfileCompletionStatus['missingItems'] = [];

  // Basic Info (Name, Date of birth, gender) -> 20%
  if (user.firstName && user.dateOfBirth && user.gender) {
    score += 20;
  } else {
    missingItems.push({
      id: 'basic_info',
      label: 'Basic Details',
      suggestion: 'Provide your name and date of birth.',
      actionType: 'bio',
    });
  }

  // Photos -> 20% (1 photo = 10%, 2+ = 20%)
  const photoCount = user.photos?.length || 0;
  if (photoCount >= 2) {
    score += 20;
  } else if (photoCount === 1) {
    score += 10;
    missingItems.push({
      id: 'photos_extra',
      label: 'Add More Photos',
      suggestion: 'Add 1 or 2 more smiling photos so companions can get to know you.',
      actionType: 'photos',
    });
  } else {
    missingItems.push({
      id: 'photos_missing',
      label: 'Profile Photos',
      suggestion: 'Upload at least 1 or 2 clear, recent photos of yourself.',
      actionType: 'photos',
    });
  }

  // Bio / About Me -> 15%
  if (user.bio && user.bio.trim().length >= 25) {
    score += 15;
  } else {
    missingItems.push({
      id: 'bio_missing',
      label: 'About Me',
      suggestion: 'Write a few heartfelt sentences about your life, passions, and what brings you joy.',
      actionType: 'bio',
    });
  }

  // Interests -> 15% (at least 3)
  if (user.interests && user.interests.length >= 3) {
    score += 15;
  } else {
    missingItems.push({
      id: 'interests_missing',
      label: 'Interests & Passions',
      suggestion: 'Select at least 3 favorite interests to discover members who share your hobbies.',
      actionType: 'interests',
    });
  }

  // Relationship Goals -> 10%
  if (user.relationshipGoals && user.relationshipGoals.length > 0) {
    score += 10;
  } else {
    missingItems.push({
      id: 'goals_missing',
      label: 'Relationship Intentions',
      suggestion: 'Share what kind of connection you are seeking (Companionship, Friendship, Serious Relationship).',
      actionType: 'goals',
    });
  }

  // Lifestyle -> 10%
  if (user.lifestyle && (user.lifestyle.activityLevel || user.lifestyle.exercise || user.lifestyle.smoking)) {
    score += 10;
  } else {
    missingItems.push({
      id: 'lifestyle_missing',
      label: 'Lifestyle Habits',
      suggestion: 'Share your daily pace, travel rhythm, or pet preferences.',
      actionType: 'lifestyle',
    });
  }

  // Values (Optional, respectful) -> 10%
  if (user.values && user.values.length > 0) {
    score += 10;
  } else {
    missingItems.push({
      id: 'values_missing',
      label: 'Personal Values',
      suggestion: 'Optionally highlight values close to your heart such as Family, Kindness, or Honesty.',
      actionType: 'values',
    });
  }

  const finalPercentage = Math.min(score, 100);

  let message = `Your profile is ${finalPercentage}% complete.`;
  if (finalPercentage >= 90) {
    message = `Your profile is ${finalPercentage}% complete. Looking wonderful!`;
  } else if (finalPercentage >= 70) {
    message = `Your profile is ${finalPercentage}% complete. Great progress!`;
  } else {
    message = `Your profile is ${finalPercentage}% complete. Take your time.`;
  }

  return {
    percentage: finalPercentage,
    message,
    missingItems,
  };
}
