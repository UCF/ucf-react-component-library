/**
 * What the Section Nav's block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '@/integrations/wp/block';
import SectionNav from '../../SectionNav.tsx';

export default blockSave( SectionNav );
