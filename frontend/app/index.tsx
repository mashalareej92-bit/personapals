// uvicorn main:app --reload --host 0.0.0.0 --port 8000
// venv\Scripts\activate

import { useState } from 'react';
import SplashScreen from './screens/SplashScreen';
import Missions from './screens/Missions';
import QuestScreen from './screens/QuestScreen';
import { useAndroidBack } from './hooks/useAndroidBack';
import { useProfileStore } from './constants/profileStore';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const profile = useProfileStore();

  // Android hardware back / back-swipe:
  //  - On a quest → go back to missions (and refresh stats), don't exit
  //  - On missions → let Android exit
  useAndroidBack(() => {
    if (selectedTask) {
      setSelectedTask(null);
      profile.refresh();
      return true;
    }
    return false;
  });

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (selectedTask) {
    return (
      <QuestScreen
        task={selectedTask}
        onBack={() => { setSelectedTask(null); profile.refresh(); }}
      />
    );
  }

  return <Missions onSelectTask={(task) => setSelectedTask(task)} />;
}
