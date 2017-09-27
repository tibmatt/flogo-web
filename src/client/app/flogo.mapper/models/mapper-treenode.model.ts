/**
 * Created by szuniga on 5/4/17.
 */
import { TreeNode } from 'primeng/components/common/api';

export interface MapperTreeNode extends TreeNode {
  path?: string;
  snippet?: string;
  level?: number;
  /**
   * Data type of the element represented by this node
   */
  dataType?: string;
  /**
   * Only applicable to arrays or collections.
   * Data type of the elements inside the array or collection represent by this node.
   * For example, for an array of strings
   * dataType: "array"
   * memberType: "string"
   */
  memberType?: string;
  isVisible?: boolean;
  isSelectable?: boolean;
}

