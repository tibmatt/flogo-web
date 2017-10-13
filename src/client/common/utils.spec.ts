import {} from 'jasmine';
import { parseMapping } from './utils';


describe('Function: ParseMapping', () => {
    describe('Evaluating an activity', () => {
        beforeEach(() => {
            this.parsedMapping = parseMapping('${activity.rest_20.message}.category.id');
        });

        it('Should extract the correct attribute name', () => {
             expect(this.parsedMapping.attributeName).toEqual('message');
        });

        it('Should extract the correct taskId', () => {
         expect(this.parsedMapping.taskId).toEqual('rest_20');
        });

        it ('It cannot be root', () => {
            expect(this.parsedMapping.isRoot).toEqual(false);
        });

        it('Should extract the path', () => {
            expect(this.parsedMapping.path).toEqual('category.id');
        });
    });

    describe('Evaluating a trigger', () => {
        beforeEach(() => {
            this.parsedMapping = parseMapping('${trigger.pathParams}');
        });

        it('Should extract the correct attribute name', () => {
            expect(this.parsedMapping.attributeName).toEqual('pathParams');
        });

        it('Should be root', () => {
            expect(this.parsedMapping.isRoot).toEqual(true);
        });

        it('taskId should be null', () => {
            expect(this.parsedMapping.taskId).toBeNull();
        });
    });

    describe('Bad input', () => {
        it('On Unknown Z type should return null', () => {
            expect(parseMapping('{Z.pathParams}')).toBeNull();
            expect(parseMapping('${Z.pathParams}')).toBeNull();
        });

        it('On unclosed curly braces should return null', () => {
          expect(parseMapping('${A.pathParams')).toBeNull();
            expect(parseMapping('{A.pathParams')).toBeNull();
        });
    });

});





