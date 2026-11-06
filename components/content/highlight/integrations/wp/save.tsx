/**
 * What the Highlight's block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '../../../../../integrations/wp/block.tsx';
import Highlight from '../../Highlight.tsx';

export default blockSave( Highlight );
