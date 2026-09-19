/**
 * utils/traineeRecord.js
 * The trainee's own record, built from the courses their institute has published
 * and the modules they have completed — no demo data.
 */
import { formatDateRange, formatMinutes } from './courses';

const isCompleted = course => course.totalModules > 0 && course.completedModules === course.totalModules;

/**
 * One skill per course the trainee has started. Proficiency is the share of
 * modules completed; each completed module is a record in its evidence ledger.
 * Status: "completed" once every module is done, otherwise "developing".
 */
export const skillsFromCourses = (courses = []) =>
  courses
    .filter(course => course.completedModules > 0)
    .map(course => {
      const evidence = course.modules
        .filter(m => m.status === 'completed')
        .map(m => ({
          assessmentName: m.title,
          topics: m.topics ?? [],
          durationMinutes: m.durationMinutes,
          source: course.code ? `${course.title} (${course.code})` : course.title,
        }));
      return {
        id: `course-${course.id}`,
        courseId: course.id,
        name: course.title,
        category: course.category || 'General',
        proficiency: course.progress,
        status: isCompleted(course) ? 'completed' : 'developing',
        completedModules: course.completedModules,
        totalModules: course.totalModules,
        evidenceCount: evidence.length,
        evidence,
      };
    });

/**
 * The learning path: the institute's published courses in schedule order.
 * Finished courses are "completed", the first unfinished one is "current",
 * and the rest are "upcoming".
 */
export const learningPathFromCourses = (courses = []) => {
  let currentFound = false;
  return courses.map(course => {
    let status = 'upcoming';
    if (isCompleted(course)) status = 'completed';
    else if (!currentFound) {
      status = 'current';
      currentFound = true;
    }
    const totalMinutes = course.modules.reduce((sum, m) => sum + (m.durationMinutes || 0), 0);
    return {
      id: `path-${course.id}`,
      courseId: course.id,
      title: course.title,
      code: course.code,
      instructor: course.instructor,
      dates: formatDateRange(course.startDate, course.endDate),
      status,
      progress: course.progress,
      duration: formatMinutes(totalMinutes),
      modules: course.modules,
      completedModules: course.completedModules,
      totalModules: course.totalModules,
      topicsCovered: [
        ...new Set(course.modules.filter(m => m.status === 'completed').flatMap(m => m.topics ?? [])),
      ],
    };
  });
};

/**
 * Milestones of the trainee's journey, each reached or not from their real progress.
 * The first unreached milestone is "current".
 */
export const journeyStagesFromCourses = (courses = [], institute = '') => {
  const started = courses.filter(c => c.completedModules > 0);
  const finished = courses.filter(isCompleted);
  const modulesDone = courses.reduce((sum, c) => sum + c.completedModules, 0);
  const allFinished = courses.length > 0 && finished.length === courses.length;

  const stages = [
    {
      id: 'registered',
      name: 'REGISTERED',
      reached: true,
      description: 'Your NCCT Connect account is active.',
      milestone: 'Account created',
    },
    {
      id: 'enrolled',
      name: 'ENROLLED',
      reached: courses.length > 0,
      description: courses.length
        ? `${courses.length} course${courses.length === 1 ? '' : 's'} published for you${institute ? ` by ${institute}` : ''}.`
        : `No courses have been published${institute ? ` by ${institute}` : ' by your institute'} yet.`,
      milestone: `${courses.length} course${courses.length === 1 ? '' : 's'} available`,
    },
    {
      id: 'learning',
      name: 'LEARNING',
      reached: started.length > 0,
      description: started.length
        ? `You have completed ${modulesDone} module${modulesDone === 1 ? '' : 's'} across ${started.length} course${started.length === 1 ? '' : 's'}.`
        : 'Complete your first module to start your learning record.',
      milestone: `${modulesDone} module${modulesDone === 1 ? '' : 's'} completed`,
    },
    {
      id: 'first-course',
      name: 'FIRST COURSE DONE',
      reached: finished.length > 0,
      description: finished.length
        ? `Completed: ${finished.map(c => c.title).join(', ')}.`
        : 'Finish every module of a course to complete it.',
      milestone: `${finished.length} course${finished.length === 1 ? '' : 's'} completed`,
    },
    {
      id: 'all-courses',
      name: 'ALL COURSES DONE',
      reached: allFinished,
      description: allFinished
        ? 'You have completed every course published for you.'
        : `${courses.length - finished.length} course${courses.length - finished.length === 1 ? '' : 's'} still to complete.`,
      milestone: `${finished.length} of ${courses.length} courses completed`,
    },
  ];

  let currentFound = false;
  return stages.map(({ reached, ...stage }) => {
    let status = 'upcoming';
    if (reached) status = 'completed';
    else if (!currentFound) {
      status = 'current';
      currentFound = true;
    }
    return { ...stage, status };
  });
};
