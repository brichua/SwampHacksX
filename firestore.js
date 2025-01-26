

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

    var classImageUrl =null;

    const className = classNameElement.value.trim();
    try{
        classImageUrl = document.getElementById('classImage').value.trim();
    }catch(error){
      console.error('Error getting image url:', error);
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
        classCodeText.innerText = ' ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎ ';

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
      const projectHubLink = document.querySelector('.navbar-nav .nav-link');
      if (role === "teacher") {
        loadClasses();
        loadClassData();
        loadProjectData();
        loadGroupMembers();
        loadTasks();
        loadResources();
        sendAlert();
        generateMemberCards();

        generateHistogram();
        generatefeedBackChart();
        generateAlertHistogram();
        await loadProjectGroups();
        projectHubLink.href = 'teacher.html';
      }else if(role == "student"){
        loadStudentProjectGroups();
        loadProjectData();
        loadGroupMembers();
        loadTasks();
        loadResources();
        sendAlert();
        generateMemberCards();
        generateHistogram();
        generatefeedBackChart();
        generateAlertHistogram();
        projectHubLink.href = 'teacher.html';
      }
    } else {
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
        document.getElementById('classCode').textContent = `${classData.code}`;
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
        let totalGroupHours = 0;
        
        groupData.tasks.forEach(task =>{
          totalGroupHours += task.taskHours;
        });
        console.log(totalGroupHours/groupData.members.length);
        const groupItem = document.createElement('div');
        groupItem.classList.add('project-group');
        groupItem.innerHTML = `
          <h3>${groupData.name}</h3>
          <p>Members: ${groupData.members.join(', ')}</p>
          <p>Average Hours per Member: ${totalGroupHours/groupData.members.length} hours</p>
        `;
        groupItem.onclick = () => {
          window.location.href = `project.html?groupId=${doc.id}`; // Redirect to specific group page
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
      const projectGroups = userData.projectGroups || []; // Get the list of project group maps the student is in
  
      const groupsList = document.getElementById('projectGroupsList');
      groupsList.innerHTML = '<h2>Project Groups</h2>'; // Reset content
  
      // If no groups, show a message
      if (projectGroups.length === 0) {
        groupsList.innerHTML = '<p>You are not in any project groups yet.</p>';
        return;
      }
  
      // Query each group by its projectId from the projectGroups map
      for (const group of projectGroups) {
        const groupId = group.projectId;  // Get the projectId from the map
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
    const groupName = document.getElementById('groupName').value;
    const classCode = document.getElementById('classCode').textContent;
    const className = document.getElementById('className').innerText;
    console.log(groupName);
    console.log(classCode);
    console.log(className);
  
    if (!groupName || (!classCode || !className)) {
      alert('Please enter all required information.');
      return;
    }
  
    try {
      const userId = firebase.auth().currentUser.uid;
  
      // Get the user data to determine if the user is a teacher or student
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const userRole = userData.role;  // Assuming 'role' field exists and is either 'teacher' or 'student'
  
      // Set the createdBy value based on the user's role
      const createdBy = userRole === 'teacher' ? 'teacher' : 'student';
  
      const groupCode = generateGroupCode(); // Generate unique project group code
  
      await db.collection('project_groups').add({
        name: groupName,
        classCode: userRole === 'student' ? null : classCode,  // Students may not need a class code
        className: userRole === 'student' ? null : className,
        members: [],  // Initialize with the creator as a member
        createdBy: createdBy,  // Mark the project as created by either 'teacher' or 'student'
        code: groupCode,
        announcements: [],
        tasks: [],
      });
  
      alert('Project created successfully!');
      if (userRole === 'student') {
        loadStudentProjectGroups(); // Reload the student's 
      }
      closeCreateGroupModal();
      loadProjectGroups();
      
    } catch (error) {
      console.error('Error creating project group:', error);
      alert('Error creating project group.');
    }
  }

  async function createStudentProjectGroup() {
    const groupName = document.getElementById('groupName').value.trim();
  
    // Students only need a group name and class code
    if (!groupName) {
      alert('Please enter all required information.');
      return;
    }
  
    try {
      const userId = firebase.auth().currentUser.uid;
  
      // Get the user data to determine if the user is a student
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const userRole = userData.role;  // Assuming 'role' field exists and is either 'teacher' or 'student'
  
      // Ensure the user is a student
      if (userRole !== 'student') {
        alert('Only students can create projects.');
        return;
      }
  
      const userName = `${userData.firstName} ${userData.lastName}`; // Combine first and last name
      const groupCode = generateGroupCode(); // Generate unique project group code
  
      // Create the project group with additional fields for tracking progress
      const projectGroupRef = await db.collection('project_groups').add({
        name: groupName,
        members: [userName],  // Initialize with the creator's full name
        memberIDs: [userId],  // Initialize with the creator's userId
        createdBy: 'student',  // Mark the project as created by a student
        code: groupCode,
        tasks: [],
        resources: [],
        totalHours: 0,
        totalTasks: 0,
        tasksCompleted: 0,
        progressPercent: 0,
        nextDeadline: null
      });
  
      // Update the student's projectGroups with the new project ID and initialize the map for the group
      const userRef = firebase.firestore().collection('Users').doc(userId);
      const userDocSnapshot = await userRef.get();
      const userProjectGroups = userDocSnapshot.data().projectGroups || [];
  
      // Add the new project ID to the student's projectGroups if not already included
      if (!userProjectGroups.some(group => group.projectId === projectGroupRef.id)) {
        userProjectGroups.push({
          projectId: projectGroupRef.id,
          tasks: [],           // Initialize tasks map for the group
          totalHours: 0,       // Initialize totalHours for the group
          totalTasks: 0,       // Initialize totalTasks for the group
          tasksCompleted: 0,   // Initialize tasksCompleted for the group
          progressPercent: 0,  // Initialize progressPercent for the group
          nextDeadline: null   // Initialize nextDeadline for the group
        });
        await userRef.update({
          projectGroups: userProjectGroups
        });
      }
  
      alert('Project created successfully!');
      loadStudentProjectGroups(); // Reload the student's projects
      closeCreateGroupModal();
    } catch (error) {
      console.error('Error creating project group:', error);
      alert('Error creating project group.');
    }
  }
  
  
  async function joinGroup() {
    try {
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
  
      const groupDoc = groupQuerySnapshot.docs[0];
      const groupData = groupDoc.data();
      const groupId = groupDoc.id;
  
      // Fetch user data (first name and last name) from the users collection
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const fullName = `${userData.firstName} ${userData.lastName}`;
  
      // Ensure the 'members' and 'memberIDs' fields exist, initialize them if not
      if (!groupData.members) {
        groupData.members = [];
      }
      if (!groupData.memberIDs) {
        groupData.memberIDs = [];
      }
  
      // Check if the student is already a member
      if (groupData.memberIDs.includes(userId)) {
        alert('You are already a member of this group!');
        return;
      }
  
      // Add student’s full name and userId to the group's lists
      groupData.members.push(fullName);
      groupData.memberIDs.push(userId);
  
      // Update the group with the new members list
      await firebase.firestore().collection('project_groups').doc(groupId).update({
        members: groupData.members,
        memberIDs: groupData.memberIDs
      });
  
      // Now add the group ID to the student's projectGroups field
      const userRef = firebase.firestore().collection('Users').doc(userId);
      const userDocSnapshot = await userRef.get();
      const userProjectGroups = userDocSnapshot.data().projectGroups || [];
  
      // Ensure the student isn't already in the group (to prevent duplicates)
      if (!userProjectGroups.some(group => group.projectId === groupId)) {
        userProjectGroups.push({
          projectId: groupId,
          tasks: [],           // Initialize tasks map for the group
          totalHours: 0,       // Initialize totalHours for the group
          totalTasks: 0,       // Initialize totalTasks for the group
          tasksCompleted: 0,   // Initialize tasksCompleted for the group
          progressPercent: 0,  // Initialize progressPercent for the group
          nextDeadline: null   // Initialize nextDeadline for the group
        });
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
      const groupId = new URLSearchParams(window.location.search).get('groupId');
  
      // Check if groupId is valid
      if (!groupId) {
        console.error('Error: Group ID is missing or invalid.');
        return;
      }
  
      // Fetch project group data from Firestore
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
  
      if (!groupDoc.exists) {
        console.error('Error: Project group not found.');
        return;
      }
  
      const groupData = groupDoc.data();
  
      // Set project group name
      const projectGroupName = groupData.name || 'Unnamed Project Group';
      document.getElementById('projectGroupName').textContent = projectGroupName;
  
      // Set class name, hide class section if project was created by a student
      const className = groupData.className;
      if (className) {
        document.getElementById('className').textContent = className;
      } else {
        // Hide class section if no class name
        document.getElementById('className').parentElement.style.display = 'none';
      }
  
      // Set group code
      const groupCode = groupData.code || 'N/A';  // Assuming you store the group code in Firestore
      document.getElementById('groupCode').textContent = groupCode;
  
      // Display announcements only if project was created by a teacher
      const announcementsDiv = document.getElementById('announcements');
      if (!className) {
        announcementsDiv.parentElement.style.display = 'none';
      } else {
        const announcements = groupData.announcements || [];
        if (announcements.length > 0) {
          announcementsDiv.innerHTML = announcements.map(announcement => {
            const date = announcement.date ? new Date(announcement.date.seconds * 1000) : new Date();
            return `${announcement.message} (Posted on: ${date.toLocaleString()})`;
          }).join('<br><br>');
        } else {
          announcementsDiv.innerHTML = 'No announcements available.';
        }
      }
  
      // Display members
      const membersList = document.getElementById('membersList');
      membersList.innerHTML = '';
      (groupData.members || []).forEach(memberName => {
        const memberItem = document.createElement('li');
        memberItem.classList.add('member-item');
        memberItem.textContent = memberName;
        membersList.appendChild(memberItem);
      });
  
      // Hide the Peer Review section if the project was created by a student
      const peerReviewSection = document.getElementById('peerReviewList').parentElement;
      if (!className) {
        peerReviewSection.style.display = 'none';
      }
  
      if (role === 'teacher') {
        const feedbackList = groupData.peerReviews || [];
        const peerReviewListDiv = document.getElementById('peerReviewList');
  
        peerReviewListDiv.innerHTML = '';
  
        // Fetch and display feedback
        for (const feedback of feedbackList) {
          const reviewerId = feedback.submittedBy;
          const recipientId = feedback.recipientID;
  
          // Fetch the reviewer details
          const reviewerDoc = await firebase.firestore().collection('Users').doc(reviewerId).get();
          const reviewerData = reviewerDoc.data();
  
          // Fetch the recipient details
          const recipientDoc = await firebase.firestore().collection('Users').doc(recipientId).get();
          const recipientData = recipientDoc.data();
  
          const reviewerName = feedback.submittedBy || 'General Feedback';
          const feedbackType = feedback.feedbackType || 'General Feedback';
          const recipientName = feedback.reviewedMember || 'General Feedback';
          const feedbackNote = feedback.feedbackNote || 'No additional notes provided.';
          const submittedAt = feedback.submittedAt
            ? new Date(feedback.submittedAt.seconds * 1000).toLocaleString()
            : 'Unknown submission time';
  
          // Create a feedback card
          const feedbackCard = document.createElement('div');
          feedbackCard.classList.add('feedback-card');
  
          feedbackCard.innerHTML = `
            <div class="feedback-card-content">
              <h4 class="feedback-title">Feedback on: ${recipientName}</h4>
              <p><strong>Type:</strong> ${feedbackType}</p>
              <p><strong>Note:</strong> ${feedbackNote}</p>
              <p><strong>Submitted by:</strong> ${reviewerName}</p>
              <p><strong>Submitted at:</strong> ${submittedAt}</p>
            </div>
          `;
  
          peerReviewListDiv.appendChild(feedbackCard);
        }
      } else {
        // Hide the peer review section for students
        document.getElementById('peerReviewSection').style.display = 'none';
      }
  
      if (role === 'teacher') {
        document.getElementById('openTaskModal').style.display = 'none';
        document.getElementById('openResourceModal').style.display = 'none';
        document.getElementById('openReviewModal').style.display = 'none';
      }
  
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
      var i  = 0;
      const membersDropdown = document.getElementById('assignedTo');
      groupData.members.forEach(memberId => {
        const option = document.createElement('option');
        option.value = groupData.memberIDs[i];
        option.textContent = memberId;
        membersDropdown.appendChild(option);
        i++;
      });
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  }
  
  // Function to handle adding a task
  async function addTaskToGroup(taskName, assignedTo, assignedToID, taskDate, taskHours) {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    
    // Validate required fields
    if (!taskName || !assignedTo || !taskDate || !taskHours) {
      alert('All fields are required.');
      return;
    }
  
    if (isNaN(taskHours) || taskHours <= 0) {
      alert('Please enter a valid number of hours.');
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
  
      // Map assignedTo names to their corresponding member IDs
      const memberMap = groupData.members.reduce((map, member) => {
        map[member.name] = member.id; // Assuming 'name' is the display name in members
        return map;
      }, {});
  
      //const assignedToIDs = firebase.auth().currentUser.uid;
  
      const newTask = {
        taskName,
        assignedTo: assignedTo || [],
        assignedToID: assignedToID, // Add the corresponding member IDs
        taskDate: taskDate,
        taskHours: taskHours,
        completed: false
      };
  
      // Add new task to the group (we'll update the group itself with this later)
      const updatedTasks = [...(groupData.tasks || []), newTask];
  
      // Fetch the user's projectGroups data to update the metrics
      const userId = firebase.auth().currentUser.uid;
      const userRef = firebase.firestore().collection('Users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const userProjectGroups = userData.projectGroups || [];
  
      // Find the project group that matches the current groupId
      const updatedProjectGroups = userProjectGroups.map(group => {
        if (group.projectId === groupId) {
          // Calculate updated metrics based on user's current data
          const updatedTotalTasks = group.totalTasks + 1;
          const tasksCompleted = group.tasksCompleted;
          const progressPercent = (tasksCompleted / updatedTotalTasks) * 100;
  
          // Find the next deadline (earliest task date)
          const futureTasks = updatedTasks.filter(task => task.taskDate);
          const nextDeadline = futureTasks.length > 0
            ? futureTasks.reduce((earliest, task) => task.taskDate < earliest ? task.taskDate : earliest, futureTasks[0].taskDate)
            : null;
  
          // Return the updated project group
          return {
            ...group,
            tasks: updatedTasks,
            totalTasks: updatedTotalTasks,
            tasksCompleted: tasksCompleted,
            progressPercent: progressPercent,
            nextDeadline: nextDeadline
          };
        }
        return group;
      });
  
      // Update the user's projectGroups field with the updated group data
      await userRef.update({
        projectGroups: updatedProjectGroups
      });
  
      // Also update the project group in the 'project_groups' collection (group-level data)
      await groupDocRef.update({
        tasks: updatedTasks
      });
  
      alert('Task added successfully!');
      loadProjectData();  // Reload tasks to reflect the new one
      generateMemberCards();
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
    const assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.textContent);
    const assignedToID = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    const taskDate = document.getElementById('taskDate').value.trim();
    const taskHours = Number(document.getElementById('taskHours').value.trim());  // Capture the task hours
    
    // Validate if taskHours is entered and is a valid number
    if (!taskHours || isNaN(taskHours) || taskHours <= 0) {
      alert('Please enter a valid number of hours.');
      return;
    }
  
    // Call the function to add task to the group with the hours included
    await addTaskToGroup(taskName, assignedTo, assignedToID, taskDate, taskHours);
    
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
  
      // Update member cards dynamically
      const memberCardsContainer = document.getElementById('membersList');
      groupData.memberIDs.forEach(async (memberId) => {
        const userDoc = await firebase.firestore().collection('Users').doc(memberId).get();
        const userData = userDoc.data();
  
        if (userData) {
          const userProjectGroup = userData.projectGroups.find(pg => pg.projectId === groupId);
          if (userProjectGroup) {
            const memberCard = memberCardsContainer.querySelector(`.member-card[data-member-id="${memberId}"]`);
            if (memberCard) {
                const totalTasks = userProjectGroup.totalTasks || 0;
                const tasksCompleted = userProjectGroup.tasksCompleted || 0;
                const tasksInProgress = totalTasks - tasksCompleted;
                const totalHours = userProjectGroup.totalHours;
                const progressPercent = (tasksCompleted / totalTasks) * 100 || 0;
    
                // Update the card's content
                memberCard.querySelector('p:nth-child(2)').textContent = `Total Tasks: ${totalTasks}`;
                memberCard.querySelector('p:nth-child(3)').textContent = `Tasks Completed: ${tasksCompleted}`;
                memberCard.querySelector('p:nth-child(4)').textContent = `Tasks In Progress: ${tasksInProgress}`;
                memberCard.querySelector('p:nth-child(5)').textContent = `Total Hours: ${totalHours}`;
                const progressCircle = memberCard.querySelector('.progress-circle circle:nth-child(2)');
                progressCircle.setAttribute('stroke-dasharray', `${progressPercent * 2.83}, 283`);
                memberCard.querySelector('.progress-circle text').textContent = `${Math.round(progressPercent)}%`;
              }
          }
        }
      });
    });
  }
  
  
  // Function to load tasks and set up the progress bar
  async function loadTasks() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    const currentUserId = firebase.auth().currentUser.uid; // Get the currently logged-in user's ID
  
    try {
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
      const groupDoc = await groupDocRef.get();
      const groupData = groupDoc.data();
  
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = ''; // Clear previous tasks
  
      groupData.tasks.forEach((task, index) => {
        const isAssignedToCurrentUser = task.assignedToID[0] == currentUserId; // Check if the task is assigned to the current user
        
        // Create a task row (table row)
        const taskRow = document.createElement('tr');
        
        // Create the table data cells
        const checkboxCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const assignedCell = document.createElement('td');
        const deadlineCell = document.createElement('td');
        const statusCell = document.createElement('td');
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('complete-task');
        checkbox.checked = task.completed;
        checkbox.disabled = !isAssignedToCurrentUser; // Disable if not assigned to the current user
        checkbox.setAttribute('data-task-index', index);
        checkbox.addEventListener('change', async () => {
          const isCompleted = checkbox.checked;
          task.completed = isCompleted;
  
          // Update Firestore with new task status
          const updatedTasks = [...groupData.tasks];
          updatedTasks[index] = task;
          await groupDocRef.update({ tasks: updatedTasks });
  
          // Update progress bar
          updateProgressBar();
          
          let msg = "";
          let status = false;
          let timestamp = Date.now(); // Current timestamp in milliseconds
          let date = new Date(timestamp); // Create a Date object from the timestamp

// Convert to a readable date and time
          let formattedDate = date.toLocaleDateString(); // e.g., "1/25/2025" in MM/DD/YYYY format
          let formattedTime = date.toLocaleTimeString(); // e.g., "10:15:30 AM"



          if (task.completed){
            msg = task.assignedTo.join(', ') + ' completed ' + task.taskName + '\n' + formattedDate + ' ' + formattedTime;
            status = true;
          }else{
            msg = task.assignedTo.join(', ') + ' uncompleted ' + task.taskName + '\n' + formattedDate + ' ' + formattedTime;
          }
        
          const newAlert = {
            id: Date.now(),
            message: msg,
            completed: status
          };
          await groupDocRef.update({
            alerts: firebase.firestore.FieldValue.arrayUnion(newAlert)
          });
          sendAlert();
          
          
             
          // Update progress for the current user (only for assigned tasks)
          const userDocRef = firebase.firestore().collection('Users').doc(currentUserId);
          const userDoc = await userDocRef.get();
          const userData = userDoc.data();
  
          if (userData) {
            const userProjectGroup = userData.projectGroups.find(pg => pg.projectId === groupId);
  
            if (userProjectGroup) {
              if (isCompleted) {
                // Only update tasksCompleted if the task is assigned to the current user
                userProjectGroup.tasksCompleted = (userProjectGroup.tasksCompleted || 0) + 1;
                userProjectGroup.totalHours = (userProjectGroup.totalHours || 0) + (task.taskHours || 0);
              } else {
                userProjectGroup.tasksCompleted = Math.max(0, (userProjectGroup.tasksCompleted || 0) - 1);
                userProjectGroup.totalHours = Math.max(0, (userProjectGroup.totalHours || 0) - (task.taskHours || 0));
              }
  
              // Update Firestore with the modified project group data
              await userDocRef.update({
                projectGroups: userData.projectGroups.map(pg =>
                  pg.projectId === groupId ? userProjectGroup : pg
                ),
              });
            }
          }
  
          // Update progress bar for the group
          updateProgressBar();
        });
  
        checkboxCell.appendChild(checkbox);
  
        // Task Name
        nameCell.textContent = task.taskName;
  
        // Assigned To
        assignedCell.textContent = task.assignedTo.join(', ') || 'No one';
  
        // Deadline
        deadlineCell.textContent = task.taskDate;
  
        // Status
        const status = task.completed ? 'Completed' : 'Pending';
        statusCell.textContent = status;
        statusCell.classList.add(task.completed ? 'status-completed' : 'status-pending');
  
        // Append cells to the row
        taskRow.appendChild(checkboxCell);
        taskRow.appendChild(nameCell);
        taskRow.appendChild(assignedCell);
        taskRow.appendChild(deadlineCell);
        taskRow.appendChild(statusCell);
  
        // Append the row to the table body
        taskList.appendChild(taskRow);
      });
  
      // Update progress bar after loading tasks
      updateProgressBar();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }
  
  async function sendAlert(){
    try {
      console.log("Updated");
      const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
      const groupData = groupDoc.data();

      const alertList = document.getElementById('alertList');
      alertList.innerHTML = '';  
      

      let numAlerts = groupData.alerts.length;

      if(groupData.alerts[numAlerts-1].completed == true && Date.now()-groupData.alerts[numAlerts-1].id<500){
        fireConfetti();
      }
      let limit = numAlerts-5;
      if(numAlerts<5){
        limit = 0
      }
      for (let i = numAlerts-1; i>=limit; i--){
        const alertItem = document.createElement('div');
        alertItem.classList.add('alert');
        alertItem.classList.add('alert-dismissible');
        alertItem.classList.add('border');
        alertItem.classList.add('border-dark');
        

        
        if (groupData.alerts[i].completed){
          
          alertItem.classList.add('alert-success');
          alertItem.innerHTML = `
            
            <strong class = > ${groupData.alerts[i].message} </strong>
          `;
          }else{
            
            alertItem.classList.add('alert-warning');
            alertItem.innerHTML = `
            
            <strong> ${groupData.alerts[i].message} </strong>
          `;
          }
          alertList.appendChild(alertItem);
      }
      
    } catch(error) {
      console.error('Error loading alerts:', error);
    }
       
  }
 
  setInterval(sendAlert, 1000);
  setInterval(loadTasks, 1000);
  setInterval(updateProgressBar, 1000);

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
        resourceItem.classList.add('resource-card');
        
        // Adding a thumbnail or image is optional, can be added if resources have images
        resourceItem.innerHTML = `
          <div class="resource-content">
            <h4 class="resource-title">${resource.note}</h4>
            ${resource.link ? `<a href="${resource.link}" target="_blank" class="resource-link">${resource.link}</a>` : ''}
          </div>
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

  function goBack() {
    const userId = firebase.auth().currentUser.uid;
  
    // Get the user data to determine if the user is a teacher or student
    firebase.firestore().collection('Users').doc(userId).get()
      .then(userDoc => {
        const userData = userDoc.data();
        const userRole = userData.role;  // Assuming 'role' field exists and is either 'teacher' or 'student'
  
        if (userRole === 'student') {
          // Redirect to student hub
          window.location.href = 'student.html'; // Replace with actual URL for student hub
        } else if (userRole === 'teacher') {
          // Redirect to teacher hub
          window.location.href = 'teacher.html'; // Replace with actual URL for teacher hub
        } else {
          console.error('Error: Unknown user role.');
        }
      })
      .catch(error => {
        console.error('Error retrieving user data:', error);
      });
  }
  
  let selectedFeedback = null;

  // Function to handle feedback type selection
  function selectFeedback(feedbackType) {
    selectedFeedback = feedbackType;
  
    // Highlight the selected button
    document.querySelectorAll('.emoji-button').forEach(button => {
      button.style.border = 'none'; // Reset all borders
    });
    document.getElementById(feedbackType).style.border = '2px solid blue';
  }
  
  // Populate members in the dropdown
  async function populateMembers() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    const groupDoc = await firebase.firestore().collection('project_groups').doc(groupId).get();
  
    if (groupDoc.exists) {
      const members = groupDoc.data().members || [];
      const selectMember = document.getElementById('selectMember');
  
      // Populate the dropdown
      members.forEach(member => {
        const option = document.createElement('option');
        option.value = member; // Member ID
        option.textContent = member; // Member Name
        selectMember.appendChild(option);
      });
    }
  }

  populateMembers();
  
  // Submit feedback form
  document.getElementById('reviewForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const userId = firebase.auth().currentUser.uid;
    const feedbackNote = document.getElementById('feedbackNote').value.trim();
    const feedbackType = selectedFeedback;
    const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();
      const submittedBy = `${userData.firstName} ${userData.lastName}`;
    const selectedMemberId = document.getElementById('selectMember').value;
  
    // Validate required fields
    if (!feedbackType) {
      alert('Please select a feedback type.');
      return;
    }
    if (!selectedMemberId) {
      alert('Please select a member to review.');
      return;
    }
  
    try {
      const groupId = new URLSearchParams(window.location.search).get('groupId');
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
  
      // Fetch the member receiving feedback
      const groupDoc = await groupDocRef.get();
      const members = groupDoc.data().members || [];

  
      // Prepare feedback data
      const feedbackData = {
        feedbackType,
        feedbackNote,
        submittedBy: submittedBy,
        reviewedMember: selectedMemberId,
        submittedAt: new Date(),
      };
  
      // Store feedback in the database
      await groupDocRef.update({
        peerReviews: firebase.firestore.FieldValue.arrayUnion(feedbackData),
      });
  
      alert('Feedback submitted successfully!');
      closeModal('reviewModal');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback.');
    }
  });
  
  // Initialize members dropdown when the modal opens
  document.getElementById('reviewModal').addEventListener('show', populateMembers);


function fireConfetti(){
  confetti({
    particleCount: 300,
    startVelocity: 60,
    spread: 100,
    origin: { y: 1.1 }
  });
}
  async function generateMemberCards() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
  
    try {
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
      const groupDoc = await groupDocRef.get();
      const groupData = groupDoc.data();
  
      const memberListContainer = document.getElementById('membersList');
      memberListContainer.innerHTML = ''; // Clear previous cards
  
      // Store member cards for quick updates
      const memberCardsMap = new Map();
  
      // Loop through the member IDs and generate their cards
      for (const memberId of groupData.memberIDs) {
        const userDocRef = firebase.firestore().collection('Users').doc(memberId);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
  
        if (userData) {
          const userProjectGroup = userData.projectGroups.find(projectGroup => projectGroup.projectId === groupId);
  
          if (userProjectGroup) {
            const memberName = `${userData.firstName} ${userData.lastName}`;
            const totalTasks = userProjectGroup.totalTasks;
            const tasksCompleted = userProjectGroup.tasksCompleted;
            const tasksInProgress = totalTasks - tasksCompleted;
            const totalHours = userProjectGroup.totalHours;
            const progressPercent = (tasksInProgress / totalTasks) * 100 || 0;
            const nextDeadline = userProjectGroup.nextDeadline || 'No upcoming deadlines';
  
            // Create a card for the member
            const memberCard = document.createElement('div');
            memberCard.classList.add('member-card');
            memberCard.dataset.memberId = memberId; // Attach memberId for updates
  
            memberCard.innerHTML = `
  <h4>${memberName}</h4>
  <p><strong>Total Tasks:</strong> ${totalTasks}</p>
  <p><strong>Tasks Completed:</strong> ${tasksCompleted}</p>
  <p><strong>Tasks In Progress:</strong> ${tasksInProgress}</p>
  <p><strong>Total Hours:</strong> ${totalHours}</p>
  
  <div class="progress-circle">
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#fbeaba" stroke-width="10" fill="none"></circle>
      <circle cx="50" cy="50" r="45" stroke="#fbeaba" stroke-width="10" fill="none" 
              stroke-dasharray="${progressPercent * 2.83}, 283" 
              stroke-linecap="round"></circle>
      <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-size="16" fill="black">
        ${Math.round(progressPercent)}%
      </text>
    </svg>
  </div>
  
  <p><strong>Next Deadline:</strong> ${nextDeadline}</p>
`;
  
            memberListContainer.appendChild(memberCard);
            memberCardsMap.set(memberId, memberCard);
          }
        }
      }

      groupDocRef.onSnapshot(async (doc) => {
        const groupData = doc.data();
      
        // Clear the task table and reload tasks
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        var totalTasksTemp = 0;
        var tasksCompletedTemp = 0;
      
        groupData.tasks.forEach((task, index) => {
          const isAssignedToCurrentUser = task.assignedToID == firebase.auth().currentUser.uid;
      
          // Create task row
          const taskRow = document.createElement('tr');
      
          const checkboxCell = document.createElement('td');
          const nameCell = document.createElement('td');
          const assignedCell = document.createElement('td');
          const deadlineCell = document.createElement('td');
          const statusCell = document.createElement('td');
      
          // Checkbox
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.classList.add('complete-task');
          checkbox.checked = task.completed;
          checkbox.disabled = !isAssignedToCurrentUser;
          checkbox.setAttribute('data-task-index', index);
      
          checkbox.addEventListener('change', async () => {
            task.completed = checkbox.checked;
      
            // Update Firestore
            const updatedTasks = [...groupData.tasks];
            updatedTasks[index] = task;
            await groupDocRef.update({ tasks: updatedTasks });
      
            // Trigger an alert
            const msg = task.completed
              ? `${task.assignedTo.join(', ')} completed ${task.taskName}`
              : `${task.assignedTo.join(', ')} uncompleted ${task.taskName}`;
            const newAlert = {
              id: Date.now(),
              message: msg,
              completed: task.completed,
            };
            await groupDocRef.update({
              alerts: firebase.firestore.FieldValue.arrayUnion(newAlert),
            });
            sendAlert();
      
            // Update progress bar and member data
            updateProgressBar();
          });
      
          checkboxCell.appendChild(checkbox);
      
          // Populate other task details
          nameCell.textContent = task.taskName;
          assignedCell.textContent = task.assignedTo.join(', ') || 'No one';
          deadlineCell.textContent = task.taskDate || 'No deadline';
          statusCell.textContent = task.completed ? 'Completed' : 'Pending';
          statusCell.classList.add(task.completed ? 'status-completed' : 'status-pending');
      
          // Append cells to the row
          taskRow.appendChild(checkboxCell);
          taskRow.appendChild(nameCell);
          taskRow.appendChild(assignedCell);
          taskRow.appendChild(deadlineCell);
          taskRow.appendChild(statusCell);
      
          // Append the row to the table
          taskList.appendChild(taskRow);
      
          // Update progress metrics
          totalTasksTemp++;
          if (task.completed) tasksCompletedTemp++;
      
        // Update the progress bar
        const progressPercent = (tasksCompletedTemp / totalTasksTemp) * 100 || 0;
        const progressBar = document.getElementById('taskProgressBar');
        const progressPercentageText = document.getElementById('progressPercentage');
        progressBar.style.width = `${progressPercent}%`;
        progressPercentageText.textContent = `${Math.round(progressPercent)}%`;
    });

      });
      
    } catch (error) {
      console.error('Error generating member cards:', error);
    }
  }

    async function generateMemberCards() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
  
    try {
      const groupDocRef = firebase.firestore().collection('project_groups').doc(groupId);
      const groupDoc = await groupDocRef.get();
      const groupData = groupDoc.data();
  
      const memberListContainer = document.getElementById('membersList');
      memberListContainer.innerHTML = ''; // Clear previous cards
  
      // Store member cards for quick updates
      const memberCardsMap = new Map();
  
      // Loop through the member IDs and generate their cards
      for (const memberId of groupData.memberIDs) {
        const userDocRef = firebase.firestore().collection('Users').doc(memberId);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
  
        if (userData) {
          const userProjectGroup = userData.projectGroups.find(projectGroup => projectGroup.projectId === groupId);
  
          if (userProjectGroup) {
            const memberName = `${userData.firstName} ${userData.lastName}`;
            const totalTasks = userProjectGroup.totalTasks;
            const tasksCompleted = userProjectGroup.tasksCompleted;
            const tasksInProgress = totalTasks - tasksCompleted;
            const totalHours = userProjectGroup.totalHours;
            const progressPercent = (tasksInProgress / totalTasks) * 100 || 0;
            const nextDeadline = userProjectGroup.nextDeadline || 'No upcoming deadlines';
  
            // Create a card for the member
            const memberCard = document.createElement('div');
            memberCard.classList.add('member-card');
            memberCard.dataset.memberId = memberId; // Attach memberId for updates
  
            memberCard.innerHTML = `
            <h4>${memberName}</h4>
            <p><strong>Total Tasks:</strong> ${totalTasks}</p>
            <p><strong>Tasks Completed:</strong> ${tasksCompleted}</p>
            <p><strong>Tasks In Progress:</strong> ${tasksInProgress}</p>
            <p><strong>Total Hours:</strong> ${totalHours}</p>
            
            <div class="progress-circle">
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#fbeaba" stroke-width="10" fill="none"></circle>
                <circle cx="50" cy="50" r="45" stroke="#f8cc55" stroke-width="10" fill="none" 
                        stroke-dasharray="${progressPercent * 2.83}, 283" 
                        stroke-linecap="round"></circle>
                <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-size="16" fill="black">
                  ${Math.round(progressPercent)}%
                </text>
              </svg>
            </div>
            
            <p><strong>Next Deadline:</strong> ${nextDeadline}</p>
          `;
  
            memberListContainer.appendChild(memberCard);
            memberCardsMap.set(memberId, memberCard);
          }
        }
      }

      groupDocRef.onSnapshot(async (doc) => {
        const groupData = doc.data();
      
        // Clear the task table and reload tasks
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        var totalTasksTemp = 0;
        var tasksCompletedTemp = 0;
      
        groupData.tasks.forEach((task, index) => {
          const isAssignedToCurrentUser = task.assignedToID == firebase.auth().currentUser.uid;
      
          // Create task row
          const taskRow = document.createElement('tr');
      
          const checkboxCell = document.createElement('td');
          const nameCell = document.createElement('td');
          const assignedCell = document.createElement('td');
          const deadlineCell = document.createElement('td');
          const statusCell = document.createElement('td');
      
          // Checkbox
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.classList.add('complete-task');
          checkbox.checked = task.completed;
          checkbox.disabled = !isAssignedToCurrentUser;
          checkbox.setAttribute('data-task-index', index);
      
          checkbox.addEventListener('change', async () => {
            task.completed = checkbox.checked;
      
            // Update Firestore
            const updatedTasks = [...groupData.tasks];
            updatedTasks[index] = task;
            await groupDocRef.update({ tasks: updatedTasks });
      
            // Trigger an alert
            const msg = task.completed
              ? `${task.assignedTo.join(', ')} completed ${task.taskName}`
              : `${task.assignedTo.join(', ')} uncompleted ${task.taskName}`;
            const newAlert = {
              id: Date.now(),
              message: msg,
              completed: task.completed,
            };
            await groupDocRef.update({
              alerts: firebase.firestore.FieldValue.arrayUnion(newAlert),
            });
            sendAlert();
      
            // Update progress bar and member data
            updateProgressBar();
          });
      
          checkboxCell.appendChild(checkbox);
      
          // Populate other task details
          nameCell.textContent = task.taskName;
          assignedCell.textContent = task.assignedTo.join(', ') || 'No one';
          deadlineCell.textContent = task.taskDate || 'No deadline';
          statusCell.textContent = task.completed ? 'Completed' : 'Pending';
          statusCell.classList.add(task.completed ? 'status-completed' : 'status-pending');
      
          // Append cells to the row
          taskRow.appendChild(checkboxCell);
          taskRow.appendChild(nameCell);
          taskRow.appendChild(assignedCell);
          taskRow.appendChild(deadlineCell);
          taskRow.appendChild(statusCell);
      
          // Append the row to the table
          taskList.appendChild(taskRow);
      
          // Update progress metrics
          totalTasksTemp++;
          if (task.completed) tasksCompletedTemp++;
      
        // Update the progress bar
        const progressPercent = (tasksCompletedTemp / totalTasksTemp) * 100 || 0;
        const progressBar = document.getElementById('taskProgressBar');
        const progressPercentageText = document.getElementById('progressPercentage');
        progressBar.style.width = `${progressPercent}%`;
        progressPercentageText.textContent = `${Math.round(progressPercent)}%`;
      
    });

      });

      groupDocRef.onSnapshot(async () => {
        
        for (const memberId of groupData.memberIDs) {
          const userDoc = await firebase.firestore().collection('Users').doc(memberId).get();
          const userData = userDoc.data();

          if (userData) {
            const userProjectGroup = userData.projectGroups.find(projectGroup => projectGroup.projectId === groupId);
  
            if (userProjectGroup) {
              const memberCard = memberCardsMap.get(memberId);
              if (memberCard) {
                const totalTasks = userProjectGroup.totalTasks || 0;
                const tasksCompleted = userProjectGroup.tasksCompleted || 0;
                const tasksInProgress = totalTasks - tasksCompleted;
                const totalHours = userProjectGroup.totalHours;
                const progressPercent = (tasksCompleted / totalTasks) * 100 || 0;
    
                // Update the card's content
                memberCard.querySelector('p:nth-child(2)').textContent = `Total Tasks: ${totalTasks}`;
                memberCard.querySelector('p:nth-child(3)').textContent = `Tasks Completed: ${tasksCompleted}`;
                memberCard.querySelector('p:nth-child(4)').textContent = `Tasks In Progress: ${tasksInProgress}`;
                memberCard.querySelector('p:nth-child(5)').textContent = `Total Hours: ${totalHours}`;
                const progressCircle = memberCard.querySelector('.progress-circle circle:nth-child(2)');
                progressCircle.setAttribute('stroke-dasharray', `${progressPercent * 2.83}, 283`);
                memberCard.querySelector('.progress-circle span').textContent = `${Math.round(progressPercent)}%`;
              }
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error generating member cards:', error);
    }
  }

  async function updateCard(){
    for (const memberId of groupData.memberIDs) {
        const userDoc = await firebase.firestore().collection('Users').doc(memberId).get();
        const userData = userDoc.data();

        if (userData) {
          const userProjectGroup = userData.projectGroups.find(projectGroup => projectGroup.projectId === groupId);

          if (userProjectGroup) {
            const memberCard = memberCardsMap.get(memberId);
            if (memberCard) {
              const totalTasks = userProjectGroup.totalTasks || 0;
              const tasksCompleted = userProjectGroup.tasksCompleted || 0;
              const tasksInProgress = totalTasks - tasksCompleted;
              const totalHours = userProjectGroup.totalHours;
              const progressPercent = (tasksCompleted / totalTasks) * 100 || 0;
  
              // Update the card's content
              memberCard.querySelector('p:nth-child(2)').textContent = `Total Tasks: ${totalTasks}`;
              memberCard.querySelector('p:nth-child(3)').textContent = `Tasks Completed: ${tasksCompleted}`;
              memberCard.querySelector('p:nth-child(4)').textContent = `Tasks In Progress: ${tasksInProgress}`;
              memberCard.querySelector('p:nth-child(5)').textContent = `Total Hours: ${totalHours}`;
              const progressCircle = memberCard.querySelector('.progress-circle circle:nth-child(2)');
              progressCircle.setAttribute('stroke-dasharray', `${progressPercent * 2.83}, 283`);
              memberCard.querySelector('.progress-circle span').textContent = `${Math.round(progressPercent)}%`;
            }
          }
        }
      }
  }
  
  // Add event listener to the sign-out link
document.getElementById('signOut').addEventListener('click', () => {
  //event.preventDefault(); // Prevent the default link behavior
  console.log("clocked");
  logOutUser();
});

async function generateHistogram(){
const groups = await db.collection('project_groups').where('classCode', '==', classCode).get();
      let completionStats = [];
      groups.forEach(doc => {
        const groupData = doc.data();

        const totalTasks = groupData.tasks.length;
        const completedTasks = groupData.tasks.filter(task => task.completed).length;
  
        // Calculate progress as a percentage
        const progressPercentage = (completedTasks / totalTasks) * 100;
        completionStats.push(progressPercentage);
      });
      
  var trace = {
    x: completionStats,
    type: "histogram",
    marker: {
      color: '#9dd1cc',
    },
  };
  var data = [trace];
  var layout = {
    title: {
      text: "Groups Progress"
    },
    xaxis: {
        title: {
            text: "Percentage of Tasks Completed"
        },
        range: [0, 100]
        
    },
    yaxis: {
        title: {
            text: "Number of Groups"
        }

    },
    paper_bgcolor: '#faf7ed',
    
  };
  Plotly.newPlot('completionHistogram', data,layout);
}

async function generatefeedBackChart(){
  const groups = await db.collection('project_groups').where('classCode', '==', classCode).get();
      let positiveRev = 0;
      let neutralRev = 0;
      let negativeRev = 0;
      groups.forEach(doc => {
        const groupData = doc.data();
        
        positiveRev += groupData.peerReviews.filter(review => review.feedbackType == "positive").length;
        neutralRev += groupData.peerReviews.filter(review => review.feedbackType == "neutral").length;
        negativeRev += groupData.peerReviews.filter(review => review.feedbackType == "negative").length;
    });
    
    var data = [{
      values: [positiveRev, neutralRev, negativeRev],
      labels: ['Positive', 'Neutral', 'Negative'],
      type: 'pie',
      marker: {
        colors: ['#7595a3','#f8cc55','#fcccb8'],
      },
    }];

    var layout = {
      title: {
        text: 'Student Peer Review Feedback'
      },
      paper_bgcolor: '#faf7ed',
    };
    Plotly.newPlot('reviewPie',data, layout);
    
}

async function generateAlertHistogram(){
  const groups = await db.collection('project_groups').where('classCode', '==', classCode).get();
      let alertTimes = [];
      groups.forEach(doc => {
        const groupData = doc.data();

        
        const completionAlerts = groupData.alerts.filter(alert => alert.completed);
        completionAlerts.forEach(alert=>{
          alertTimes.push((alert.id-Date.now())/(8.64e+7));    
        });
      });
      
      
    var trace = {
      x: alertTimes,
      type: "histogram",
      marker: {
        color: '#7595a3',
      },
    };
    var data = [trace];
    var layout = {
      title: {
        text: "Timings of Task Completion Notifications"
      },
      xaxis: {
          title: {
              text: "Days Ago"
          },
          range: [Math.min(...alertTimes), 0]
          
      },
      yaxis: {
          title: {
              text: "Number of Notifications"
          }
  
      },
      paper_bgcolor: '#faf7ed',
      
    };
    Plotly.newPlot('alertHistogram', data,layout);

}