/**
 * What the Card's block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '../../../../../integrations/wp/block.tsx';
import Card from '../../Card.tsx';
import metadata from './block.json';

export default blockSave( Card, metadata );
