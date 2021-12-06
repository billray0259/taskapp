# TaskApp
Equitably assign tasks to roommates. Collaboratively create a list of periodic tasks that need to be done and individually assign effort scores to each task. Calculate per-task point values based on effort scores. Assign tasks to users as they become relevant in a way that is equitable and takes advantage of users differing preferences.

## Things I’ve learned:
* Users don’t regularly update their effort scores
    * Make effort scores update automatically
        * Increase when users says No to assignment
        * Decrease when a different user completes the assignment
* Users don’t regularly update the period of tasks
* Not all users complete a task with the same thoroughness
    * Even when the task is describe in the task description
* Some users need an accountability system to reward/punish users with more/fewer points.
    * Perhaps when points get too unbalanced it summons everyone for a group discussion
* Users forget to set themselves to inactive
    * Send reminders to users to do their tasks, if they are reminded and away they will likely remember to change their inactivity status
        * Alert other users when a user goes inactive to prevent inactivty-fraud
    * Use phone’s location to determine if the user has been away for more than a day and then ask them if they are still active in that house

## Algorithm:
* Each user has a hidden effort score for each task
* When a task is created each user’s effort score is set to that users median effort score
    * If the user has no effort scores (ie when the first task is created) the effort score is set to 1
* When a new user joins a house the new user's effort scores are set to the average user's effort scores
* Each task has a period and a time of last completion
* When the amount of time elapsed since the task’s last completion becomes greater than 75% of the task’s period the task is assigned to a user
* A user can complete a task and receive a point value equal to the average of the user’s roommates’ normalized effort score for that task
* The normalized effort score of a user for a task is the users effort score for that task divided by that users average effort score over all tasks
* When a user completes an assignment the roommate’s effort scores are reduced by 5% for the corresponding task
* Tasks are first assigned to whichever user has the fewest hypothetical points per day
* Hypothetical points are the number of points a user has plus the number of points that exist in the tasks currently assigned to them
* The task to assign to the user is determined by calculating the number of points received by each user for each task to be assigned and selecting the task with the largest difference between the number of points this user would receive for this task and the number of points the user who would receive the most points and who is not the user with the fewest points
* The user also has the option to say “No” to the task which will increase the user’s effort score for this task is increased such that the task gets assigned to someone else
* When the elapsed time to complete a task reaches 125% of the task’s period the user’s effort score is increased similarly to if the user had said “No”
    * The next user has an amount of time equal to 50% of the task’s period to complete the task before they automatically say “No” to the task
* When multiple users complete the same assignment the points awarded to each user are equal to the points the user would have received if they had done the task alone divided by the total number of users which completed the assignment

## Pages:
* Register
    * Display Name
    * Email
    * Password
    * Confirm Password
* Login
    * Email
    * Password
* Manage House
    * Create House
    * Join House
    * Invite to house
    * Switch current house
    * DATA:
        * Which house the user is in
        * Roommates
        * Roommates active time
    
* Assignments
    * Your Tasks
        * List of tasks assigned to you grouped by room
    * Other Tasks
        * List of tasks not assigned to you grouped by room
    * COMPONENTS: 
        * Task List
            * Heading
            * Contains list of Assignments
        * Assignment
            * Task Name
            * Point value
                * Number of points the current user would receive for completing the task
            * Progress bar
                * Clickable to modify the last completed time 
            * Expands on click
                * Selectable Roommate names
                * Complete Button
                        * Distributes points to selected roommates
                        * Updates the last completed time
                * “No” Button
                    * Used if user doesn’t think the task is worth the current number of points
                    * Increases effort score for that user such that the task gets assigned to someone else
                * Cancel Button
                    * Un-expands the assignment
            * Clickable progress bar
                * Becomes editable on click
                * Can slide around and save the new value
    * DATA:
        * Tasks in current house
            * Task Name
            * Task Description
            * Last completed time
            * Period
        * Roommate points
        * Roommate effort scores
        * Roommate active seconds
* Tasks
    * Create
        * Task Name
        * Task Description
        * Period
        * Room
        * Last Completed
    * Read
    * Update
    * Delete
    * DATA:
        * All task info for all tasks in the active house
* Records
    * List of completed assignments
    * Update
    * Delete
    * Updating and deleting reserved for the individual who complete the assignment
        * Updating task may affect the number of points the user has
        * Can only remove points
    * DATA:
        * A subset of the records in the active house
* Points
    * View each users average daily points
    * DATA:
        * Number of points each user has
* Settings
    * Update display name
    * Update active status
    * DATA:
        * Active status

## Collections:
* members 
    * <user_id>
        * display_name: <display_name>
        * houses:
            * <house_id>: <is_active>
            * ...
    * …
* houses:
    * <house_id>
        * house_name: 
        * house_code: <house_code>
        * occupants:
            * <user_id>:
                * display_name: <display_name>
                * n_summed_points: <n_points>
                * last_summed_time: <summed_time>
                * active_seconds: <n_active_seconds>
                * last_activated: <last_activated_time>
                * is_active: <is_active>
                * effort_scores:
                    * <task_id>: <score>
                    * …
            * …
        * tasks:
            * <task_id>:
                * task_name: <task_name>
                * task_description: <task_description>
                * period: <period>
                * last_completed: <last_completed>
            * …
        * records:
            * <record_id>:
                * task_id: <task_id>
                * completed_by: <user_id>
                * points_awarded: <points_awarded>
                * time_completed: <time_completed>

    * …