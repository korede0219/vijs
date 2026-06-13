/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type View = "Library" | "Workspace" | "History" | "Settings";

export type Category = 'Tooling' | 'Data Analysis' | 'Creative' | 'Automation' | 'DevOps';

export interface Prompt {
  id: string;
  title: string;
  category: Category;
  content: string;
  model: string;
  updatedAt: any; // Using any for Firestore Timestamp support
  authorId: string;
}
