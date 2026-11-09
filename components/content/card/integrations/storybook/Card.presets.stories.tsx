/**
 * The Card's presets (Card.presets.ts), each alone and, where the pages set them in rows, as
 * a row. A new preset gets a story here.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Card from '../../Card.tsx';
import { base, grid, preset } from './shared.tsx';

const meta = {
	...base,
	title: 'Content (Server)/Card/Presets',
} satisfies Meta< typeof Card >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Story card: image, category and date, sans title, a sentence. */
export const StoryCard: Story = preset( 'story' );

/** Next step card: boxed title, a sentence, one button. */
export const NextStep: Story = preset( 'next-step' );

/** Audience tile: a square on Bold Gold, the photo under a tint, centered. */
export const Audience: Story = preset( 'audience' );

/** Three audience tiles in a row, as the admissions page sets them. */
export const AudienceGrid: Story = grid( 'audience', 3 );

/** Pathway card: Dark, an eyebrow, a display title, a sentence and an arrow link. */
export const Pathway: Story = preset( 'pathway' );

/** Four pathway cards in a row: "Which of these are you?" */
export const PathwayGrid: Story = grid( 'pathway', 4 );

/** Media tile: a photo under a gradient, a tag pinned to the corner, a caption at the bottom. */
export const Media: Story = preset( 'media' );

/** Four media tiles in a row, as the campus strip sets them. */
export const MediaGrid: Story = grid( 'media', 4 );
