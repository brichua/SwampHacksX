
const firebaseConfig = {
    apiKey: "AIzaSyCfTQ5WMHn3AwBLF0VJ-wsNen3PYYNANPc",
    authDomain: "swamphacksx.firebaseapp.com",
    projectId: "swamphacksx",
    storageBucket: "swamphacksx.firebasestorage.app",
    messagingSenderId: "764838007641",
    appId: "1:764838007641:web:94e09582556a582f3bb248",
    measurementId: "G-0D57KWX26F"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

    try {
        await firebase.auth().setPersistence(persistence);
        await firebase.auth().signInWithEmailAndPassword(email, password);
        var role = await db.collection("Users").doc(firebase.auth().currentUser.uid).get().then(doc => doc.get('role'));
        if(role == "student"){
            window.location.href = "student.html";
        }else if(role == "teacher"){
            window.location.href = "teacher.html";
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert(error);
    }
}

async function signup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        await db.collection("Users").doc(firebase.auth().currentUser.uid).set({
            email: email,
        });
        window.location.href = "createUser.html";
    } catch (error) {
        console.error("Error signing up:", error);
        alert(error)
    }
}

async function logOutUser() {
    try {
        await firebase.auth().signOut();
        console.log('User signed out successfully');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

async function createUser() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const role = document.getElementById('role').value;

    if (!firstName || !lastName || !role) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await db.collection("Users").doc(firebase.auth().currentUser.uid).update({
        firstName: firstName,
        lastName: lastName,
        role: role,
        createdAt: new Date()
      });

      alert('User created successfully!');
      window.location.href = role === 'teacher' ? 'teacher.html' : 'student.html';
    } catch (error) {
      console.error('Error creating user: ', error);
      alert('Error creating user. Please try again.');
    }
  }

  function openModal() {
    document.getElementById('classModal').style.display = 'flex';
  }
  function closeModal() {
    document.getElementById('classModal').style.display = 'none';
  }

  var role;

  async function getRole() {
    const userDoc = await db.collection("Users").doc(firebase.auth().currentUser.uid).get();
    role = userDoc.get('role');
  }
  
// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  async function createClass() {
    const userId = firebase.auth().currentUser.uid;
    const classNameElement = document.getElementById('className');
    if (!classNameElement) {
        console.error("Class name input element not found.");
        return;
    }

    const classImageUrl =null;

    const className = classNameElement.value.trim();
    try{
        classImageUrl = document.getElementById('classImage').value;
    }catch(error){

    }

    if (!className) {
        alert("Please enter a class name.");
        return;
    }

    const classColor = getRandomColor();  // Generate random color

    try {
        await db.collection('classes').add({
            name: className,
            teacherId: userId,
            imageUrl: classImageUrl,
            color: classImageUrl ? null : classColor,  // Store color only if no image is provided
            code: generateClassCode(),  // Assuming a function that generates a unique class code
        });

        alert('Class created successfully!');
        loadClasses();  // Reload the classes after creation
        closeModal();  // Close the modal
    } catch (error) {
        console.error('Error creating class:', error);
        alert('Error creating class. Please try again.');
    }
}
  
  function generateClassCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();; // Generate a random 8-character code
  }
  
  // Loading classes
  async function loadClasses() {
    try {
      const userId = firebase.auth().currentUser.uid;
      const classList = document.getElementById('classList');
  
      classList.innerHTML = '<h2>Your Classes</h2>';
  
      const classes = await db.collection('classes').where('teacherId', '==', userId).get();
  
      classes.forEach(doc => {
        const classData = doc.data();
  
        // Create the class item container
        const classItem = document.createElement('div');
        classItem.classList.add('class-item');
        
        // Create the image square (either the actual image or a random color block)
        const classImage = document.createElement('div');
        classImage.classList.add('class-image');
        if (classData.imageUrl) {
          const img = document.createElement('img');
          img.src = classData.imageUrl;
          img.alt = 'Class Image';
          img.style.width = '100%';
          img.style.height = '100%';
          classImage.appendChild(img);
        } else {
          // Use the stored color from the database
          classImage.style.backgroundColor = classData.color || getRandomColor(); // Fallback to random if missing color
        }
  
        // Create class name and code section
        const classInfo = document.createElement('div');
        classInfo.classList.add('class-info');
        const classText = document.createElement('div');
        classText.innerHTML = `<strong>${classData.name}</strong>`;
  
        const classCodeContainer = document.createElement('div');
        classCodeContainer.classList.add('class-code-container');
        
        // "Code:" label without any special styling
        const codeLabel = document.createElement('span');
        codeLabel.innerText = 'Code:';
        codeLabel.style = 'margin-right: 5px;';  // Optional, just for spacing

        // Invisible code with background color, initially hidden text
        const classCodeText = document.createElement('span');
        classCodeText.classList.add('class-code');
        classCodeText.innerText = '‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ';

        // Add hover effect to the container, not the text itself
        classCodeContainer.onmouseover = () => {
          classCodeText.innerText = classData.code;  // Show text when hovered
        };
        classCodeContainer.onmouseleave = () => {
          classCodeText.innerText = "‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎ ‎ ‎ ";  // Hide text when not hovered
        };
  
        // Make the code clickable for copying
        classCodeText.onclick = function(event) {
          event.stopPropagation();  // Prevent redirection
          copyToClipboard(classData.code);  // Copy code to clipboard
        };
  
        classCodeContainer.appendChild(codeLabel);
        classCodeContainer.appendChild(classCodeText);
  
        classInfo.appendChild(classText);
        classInfo.appendChild(classCodeContainer);
  
        // Make the class item block clickable to navigate to the class page
        classItem.onclick = function() {
            window.location.href = `class.html?code=${classData.code}`; // Use query parameters for class code
          };
  
        // Append the image and class info to the class item block
        classItem.appendChild(classImage);
        classItem.appendChild(classInfo);
  
        // Append the class item to the list
        classList.appendChild(classItem);
      });
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }
  
  // Function to copy code to clipboard
  function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Class code copied to clipboard!');
  }
  
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      await getRole(); // Wait for the role to be fetched
      if (role === "teacher") {
        loadClasses();
        loadClassData();
        await loadProjectGroups();
      }else if(role == "student"){
        loadStudentProjectGroups();
        loadProjectData();
        loadGroupMembers();
        loadTasks();
        loadResources();
      }
    } else {
      window.location.href = 'login.html';
    }
  });

  let classCode = new URLSearchParams(window.location.search).get('code'); // Get class code from URL
  let classData = {};

  // Modal control functions
  function openCreateGroupModal() {
    document.getElementById('createGroupModal').style.display = 'flex';
  }

  function closeCreateGroupModal() {
    document.getElementById('createGroupModal').style.display = 'none';
  }

  function openAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'flex';
  }

  function closeAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'none';
  }

  async function loadClassData() {
    try {
      const classDoc = await db.collection('classes').where('code', '==', classCode).get();
      if (!classDoc.empty) {
        classData = classDoc.docs[0].data();
        document.getElementById('className').textContent = classData.name;
        document.getElementById('classCode').textContent = `Class Code: ${classData.code}`;
      }
    } catch (error) {
      console.error('Error loading class data:', error);
    }
  }

  // Load Project Groups for the Class
  async function loadProjectGroups() {
    try {
      const groupsList = document.getElementById('projectGroupsList');
      groupsList.innerHTML = '<h2>Project Groups</h2>'; // Reset content

      const groups = await db.collection('project_groups').where('classCode', '==', classCode).get();
      groups.forEach(doc => {
        const groupData = doc.data();
        const groupItem = document.createElement('div');
        groupItem.classList.add('project-group');
        groupItem.innerHTML = `
          <h3>${groupData.name}</h3>
          <p>Members: ${groupData.members.join(', ')}</p>
        `;
        groupItem.onclick = () => {
          window.location.href = `project_group.html?groupId=${doc.id}`; // Redirect to specific group page
        };
        groupsList.appendChild(groupItem);
      });
    } catch (error) {
      console.error('Error loading project groups:', error);
    }
  }

  async function loadStudentProjectGroups() {
    try {
      const userId = firebase.auth().currentUser.uid;
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const projectGroups = userData.projectGroups || []; // Get the list of group IDs the student is in
  
      const groupsList = document.getElementById('projectGroupsList');
      groupsList.innerHTML = '<h2>Project Groups</h2>'; // Reset content
  
      // If no groups, show a message
      if (projectGroups.length === 0) {
        groupsList.innerHTML = '<p>You are not in any project groups yet.</p>';
        return;
      }
  
      // Query each group by its ID
      for (const groupId of projectGroups) {
        const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
        const groupData = groupDoc.data();
        const groupItem = document.createElement('div');
        groupItem.classList.add('project-group');
        groupItem.innerHTML = `
          <h3>${groupData.name}</h3>
          <p>Members: ${groupData.members.join(', ')}</p>
        `;
        groupItem.onclick = () => {
          window.location.href = `project.html?groupId=${groupId}`; // Redirect to specific group page
        };
        groupsList.appendChild(groupItem);
      }
    } catch (error) {
      console.error('Error loading student project groups:', error);
    }
  }

  // Create a new Project Group
  async function createProjectGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const classCode = document.getElementById('classCode').value.trim(); // Assuming you have classCode as an input field
    const className = document.getElementById('className').value.trim(); // Assuming you now have an input field for class name
    
    if (!groupName || !classCode || !className) {
      alert('Please enter a group name, class code, and class name.');
      return;
    }
  
    try {
      const groupCode = generateGroupCode();  // Generate unique project group code
  
      await db.collection('project_groups').add({
        name: groupName,
        classCode: classCode,
        className: className,  // Added className to the database
        members: [],           // Members can be added later
        code: groupCode,       // Store the generated code
        announcements: [],     // Optionally, initialize an empty array for announcements
        tasks: []              // Optionally, initialize an empty array for tasks
      });
  
      alert('Project Group created successfully!');
      loadProjectGroups();  // Reload the list of project groups
      closeCreateGroupModal();
    } catch (error) {
      console.error('Error creating project group:', error);
      alert('Error creating project group.');
    }
  }
  
  // Make an Announcement
  async function makeAnnouncement() {
    const announcementMessage = document.getElementById('announcementMessage').value.trim();
    if (!announcementMessage) {
      alert('Please enter an announcement message.');
      return;
    }

    try {
      const groups = await db.collection('project_groups').where('classCode', '==', classCode).get();
      groups.forEach(async (groupDoc) => {
        await db.collection('project_groups').doc(groupDoc.id).update({
          announcements: firebase.firestore.FieldValue.arrayUnion({
            message: announcementMessage,
            date: new Date(),
          }),
        });
      });

      alert('Announcement sent to all project groups!');
      closeAnnouncementModal();
    } catch (error) {
      console.error('Error making announcement:', error);
      alert('Error making announcement.');
    }
  }

  function generateGroupCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase(); // Generate an 8-character code
  }

  // Function to join a project group
  async function joinGroup() {
    try {
      // Grab the group code entered by the user
      const groupCode = document.getElementById('groupCode').value;
  
      // Validate groupCode before using it
      if (!groupCode) {
        console.error('Group code is undefined or empty!');
        alert('Please enter a valid group code.');
        return;
      }
  
      const userId = firebase.auth().currentUser.uid;
  
      // Query the group by its code to get the document ID
      const groupQuerySnapshot = await firebase.firestore()
        .collection('project_groups')
        .where('code', '==', groupCode)
        .get();
  
      if (groupQuerySnapshot.empty) {
        console.error('Group not found!');
        alert('The group you are trying to join does not exist.');
        return;
      }
  
      // Get the first document from the query snapshot
      const groupDoc = groupQuerySnapshot.docs[0];
      const groupData = groupDoc.data();
      const groupId = groupDoc.id; // Get the document ID
  
      // Fetch user data (first name and last name) from the users collection
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const fullName = `${userData.firstName} ${userData.lastName}`; // Combine first and last name
  
      // Ensure the 'members' field exists, initialize it if not
      if (!groupData.members) {
        groupData.members = [];
      }
  
      // Check if the student is already a member
      if (groupData.members.includes(fullName)) {
        alert('You are already a member of this group!');
        return; // Exit the function if already a member
      }
  
      // Add student’s full name to the group’s member list
      groupData.members.push(fullName);
  
      // Update the group with the new members list
      await firebase.firestore().collection('project_groups').doc(groupId).update({
        members: groupData.members
      });
  
      // Now add the group ID to the student's projectGroups field
      const userRef = firebase.firestore().collection('Users').doc(userId);
      const userDocSnapshot = await userRef.get();
      const userProjectGroups = userDocSnapshot.data().projectGroups || [];
  
      // Ensure the student isn't already in the group (to prevent duplicates)
      if (!userProjectGroups.includes(groupId)) {
        userProjectGroups.push(groupId);
        await userRef.update({
          projectGroups: userProjectGroups
        });
      }
  
      alert('You have successfully joined the group!');
      window.location.href = `project.html?groupId=${groupId}`;  // Redirect to the group’s page
    } catch (error) {
      console.error('Error joining group:', error);
      alert('An error occurred while joining the group. Please try again.');
    }
  }
  
  // Modal functions
  function openJoinModal() {
    document.getElementById('joinModal').style.display = 'flex';
  }

  function closeJoinModal() {
    document.getElementById('joinModal').style.display = 'none';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('groupId');

  async function loadProjectData() {
    try {
      // Check if groupId is valid
      if (!groupId) {
        console.error('Error: Group ID is missing or invalid.');
        return;
      }
  
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
      const groupData = groupDoc.data();
  
      // Set class name
      const className = groupData.className;
      document.getElementById('className').textContent = className;
  
      // Display announcements
      const announcements = groupData.announcements || [];
      const announcementsDiv = document.getElementById('announcements');
      announcementsDiv.innerHTML = announcements.length > 0 ? announcements.join('<br><br>') : 'No announcements available.';
  
      // Display members
      const membersList = document.getElementById('membersList');
      membersList.innerHTML = '';
      groupData.members.forEach(memberId => {
        const memberItem = document.createElement('li');
        memberItem.classList.add('member-item');
        memberItem.textContent = memberId;
        membersList.appendChild(memberItem);
      });
  
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }
  
  // Handle opening modals
  document.getElementById('openTaskModal').addEventListener('click', () => openModal('taskModal'));
  document.getElementById('openResourceModal').addEventListener('click', () => openModal('resourceModal'));
  document.getElementById('openReviewModal').addEventListener('click', () => openModal('reviewModal'));

  // Open the specified modal
  function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }

  // Close the modal
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  async function loadGroupMembers() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    try {
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      const membersDropdown = document.getElementById('assignedTo');
      groupData.members.forEach(memberId => {
        const option = document.createElement('option');
        option.value = memberId;
        option.textContent = memberId;
        membersDropdown.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  }
  
  // Function to handle adding a task
  async function addTaskToGroup(taskName, assignedTo, taskDate) {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    if (!taskName) {
      alert('Task name is required.');
      return;
    }
    
    try {
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
      const groupDoc = await groupDocRef.get();
      
      if (!groupDoc.exists) {
        console.error('Project group does not exist.');
        return;
      }
      
      const groupData = groupDoc.data();
      
      const newTask = {
        taskName,
        assignedTo: assignedTo || [],  // Default to an empty array if no one is assigned
        taskDate: taskDate ? new Date(taskDate) : null,  // Set to null if no date
        completed: false
      };
      
      const updatedTasks = [...(groupData.tasks || []), newTask];
      
      await groupDocRef.update({ tasks: updatedTasks });
      alert('Task added successfully!');
      loadProjectData();  // Reload tasks to reflect the new one
      loadTasks();
    } catch (error) {
      console.error('Error adding task to group:', error);
      alert('An error occurred while adding the task.');
    }
  }
  
  // Event listener for the task form submission
  document.getElementById('taskForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the default form submission behavior
    
    const taskName = document.getElementById('taskName').value.trim();
    const assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    const taskDate = document.getElementById('taskDate').value.trim();
    
    // Call the function to add task to the group
    await addTaskToGroup(taskName, assignedTo, taskDate);
    
    // Close the modal after adding the task
    closeModal('taskModal');
  });

  // Function to update the progress bar
function updateProgressBar() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
  
    firebase.firestore().collection('project_groups').doc(groupId).get().then(groupDoc => {
      const groupData = groupDoc.data();
      const totalTasks = groupData.tasks.length;
      const completedTasks = groupData.tasks.filter(task => task.completed).length;
      
      // Calculate progress as a percentage
      const progressPercentage = (completedTasks / totalTasks) * 100;
  
      // Update the progress bar and text
      const progressBar = document.getElementById('taskProgressBar');
      const progressText = document.getElementById('progressPercentage');
      progressBar.style.width = `${progressPercentage}%`;
      progressText.textContent = `${Math.round(progressPercentage)}%`;
    });
  }
  
  // Function to load tasks and set up the progress bar
  async function loadTasks() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    try {
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';  // Clear previous tasks
      
      groupData.tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
          <h4>${task.taskName}</h4>
          <p>Assigned to: ${task.assignedTo.join(', ') || 'No one'}</p>
          <p>Deadline: ${task.taskDate ? new Date(task.taskDate).toLocaleDateString() : 'No deadline'}</p>
          <input type="checkbox" class="complete-task" ${task.completed ? 'checked' : ''} data-task-index="${index}">
        `;
        
        taskList.appendChild(taskItem);
  
        // Add event listener to update task completion when checkbox is toggled
        const checkbox = taskItem.querySelector('.complete-task');
        checkbox.addEventListener('change', async () => {
          task.completed = checkbox.checked;
          
          // Update Firestore with new task status
          const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
          const updatedTasks = [...groupData.tasks];
          updatedTasks[index] = task;
          
          await groupDocRef.update({ tasks: updatedTasks });
  
          // Update progress bar
          updateProgressBar();
        });
      });
  
      // Update progress bar after loading tasks
      updateProgressBar();
  
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  // Function to add a new resource to Firestore
  async function addResource(note, resourceLink = '') {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    if (!note.trim()) {
      alert('Note is required.');
      return;
    }
    
    try {
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
      
      // Fetch current resources from Firestore
      const groupDoc = await groupDocRef.get();
      const groupData = groupDoc.data();
      const updatedResources = groupData.resources || [];
      
      // Add the new resource
      updatedResources.push({ note, link: resourceLink || null });
      
      // Update Firestore
      await groupDocRef.update({ resources: updatedResources });
      
      // Reload resources
      loadResources();
      
      alert('Resource added successfully!');
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    }
  }
  
  
  // Function to load and display resources
  async function loadResources() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    try {
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
      const groupData = groupDoc.data();
      const resources = groupData.resources || [];
      
      const resourceList = document.getElementById('resourceList');
      resourceList.innerHTML = ''; // Clear previous resources
      
      resources.forEach((resource) => {
        const resourceItem = document.createElement('div');
        resourceItem.classList.add('resource-item');
        resourceItem.innerHTML = `
          <h4>${resource.note}</h4>
          ${resource.link ? `<a href="${resource.link}" target="_blank">${resource.link}</a>` : ''}
        `;
        resourceList.appendChild(resourceItem);
      });
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }
  
  
  // Event listener for the resource form submission
  document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const note = document.getElementById('note').value.trim();
    const resourceLink = document.getElementById('resourceLink').value.trim();
    
    if (!note) {
      alert('Please add a note.');
      return;
    }
  
    try {
      // Directly add the resource to Firestore
      await addResource(note, resourceLink);
  
      // Reset form and close modal
      document.getElementById('resourceForm').reset();
      closeModal('resourceModal');
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    }
  });
  
  

  