'use client';

interface User {
  userId: string;
  userName: string;
  isHost: boolean;
  role?: 'super' | 'normal';
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="mr-2">👥</span>
        在线用户 ({users.length})
      </h3>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.userId}
            className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.userName}</span>
              {user.isHost && <span title="房主">👑</span>}
              {user.role === 'super' && <span title="超级节点（P2P）">⚡</span>}
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        ))}
        
        {users.length === 0 && (
          <p className="text-center text-gray-400 py-4">暂无用户</p>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          👑 房主可以控制视频<br/>
          ⚡ 超级节点用于 P2P 中继（预留）
        </p>
      </div>
    </div>
  );
}
