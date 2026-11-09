/**
 * What the Hero's block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '#integrations/wp/block.js';
import Hero from '../../Hero.tsx';

export default blockSave( Hero );
