/**
 * What the Card's block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '#integrations/wp/block.js';
import Card from '../../Card.tsx';

export default blockSave( Card );
