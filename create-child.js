const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the parent
    const parent = await prisma.parent.findFirst();
    if (!parent) {
      console.log('No parent found');
      return;
    }
    
    console.log('Parent:', parent.id, parent.name);
    
    // Create a child for this parent
    const child = await prisma.child.create({
      data: {
        name: 'Sarah Nadeem',
        type: 'BABY',
        birthday: new Date('2023-06-15'),
        height: 70,
        weight: 10,
        relationIds: [],
        parentIds: [parent.id]
      }
    });
    
    console.log('Created child:', child.id, child.name);
    
    // Update parent to include this child
    const updatedParent = await prisma.parent.update({
      where: { id: parent.id },
      data: {
        childIds: [...(parent.childIds || []), child.id]
      }
    });
    
    console.log('Updated parent with child:', updatedParent.childIds);
    console.log('Done! Parent now has a child');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
