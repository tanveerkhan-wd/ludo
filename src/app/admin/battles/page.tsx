'use client';

import { useEffect, useState } from 'react';
import { Battle } from '@prisma/client';

export default function AdminBattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [error, setError] = useState('');
  const [entryFee, setEntryFee] = useState(100);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    fetch('/api/admin/battles')
      .then((res) => {
        if (res.status === 401) {
          setError('Unauthorized: Please log in as admin.');
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBattles(data);
        } else {
          setBattles([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setBattles([]);
      });
  }, []);

  const handleCreateBattle = async () => {
    const res = await fetch('/api/admin/battles/create', {
      method: 'POST',
      body: JSON.stringify({ entryFee, roomCode }),
    });
    if (res.ok) {
      alert('Battle created');
      window.location.reload();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error || 'Failed to create battle'}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Battle Management</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Create Manual Battle</h2>
        <input type="number" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))} className="border p-2 mr-2" placeholder="Entry Fee" />
        <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="border p-2 mr-2" placeholder="Room Code" />
        <button onClick={handleCreateBattle} className="bg-green-500 text-white px-4 py-2 rounded">Create Battle</button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Battle ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {battles.map((battle) => (
            <tr key={battle.id}>
              <td className="border p-2">{battle.battleId}</td>
              <td className="border p-2">{battle.status}</td>
              <td className="border p-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
