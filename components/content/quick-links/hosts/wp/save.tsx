/**
 * CONTEXT: what the Quick Links' block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '@/core/hosts/wordpress/block';
import QuickLinks from '../../QuickLinks.tsx';

export default blockSave( QuickLinks );
